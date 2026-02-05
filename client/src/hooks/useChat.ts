import { useState, useCallback, useRef, useEffect } from 'react'
import type { Message, ChatHistory } from '../types'
import { saveChat, getChat, getChats, deleteChat } from '../utils/db'

const API_BASE = '/api'

export function useChat(currentModel: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [chatHistory, setChatHistory] = useState<ChatHistory>({})
    const [currentChatId, setCurrentChatId] = useState(() => Date.now())
    const abortControllerRef = useRef<AbortController | null>(null)

    // Load chat history on mount
    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        const chats = await getChats()
        const history: ChatHistory = {}
        chats.forEach(chat => {
            history[chat.id] = chat.title
        })
        setChatHistory(history)
    }

    // Save current chat whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            saveChat(currentChatId, messages, currentModel).then(() => {
                // Update history title if it changed (e.g. first message sent)
                const firstUserMsg = messages.find(m => m.role === 'user')
                if (firstUserMsg) {
                    const newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
                    setChatHistory(prev => {
                        if (prev[currentChatId] !== newTitle) {
                            return { ...prev, [currentChatId]: newTitle }
                        }
                        return prev
                    })
                }
            })
        }
    }, [messages, currentChatId, currentModel])

    const createNewChat = useCallback(() => {
        const newChatId = Date.now()
        setCurrentChatId(newChatId)
        setMessages([])
    }, [])

    const switchChat = useCallback(async (chatId: number) => {
        // If switching to the same chat, do nothing
        // if (chatId === currentChatId) return 

        try {
            const chat = await getChat(chatId)
            if (chat) {
                setCurrentChatId(chatId)
                setMessages(chat.messages)
            } else {
                // Fallback if not found (shouldn't happen with valid history)
                setCurrentChatId(chatId)
                setMessages([])
            }
        } catch (error) {
            console.error('Failed to load chat:', error)
        }
    }, [])

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            setIsGenerating(false)
        }
    }, [])

    const deleteHistory = useCallback(async (chatId: number) => {
        await deleteChat(chatId)
        setChatHistory(prev => {
            const newHistory = { ...prev }
            delete newHistory[chatId]
            return newHistory
        })
        if (chatId === currentChatId) {
            createNewChat()
        }
    }, [currentChatId, createNewChat])

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isGenerating) return

        setIsGenerating(true)
        abortControllerRef.current = new AbortController()

        const userMessage: Message = { role: 'user', content }
        setMessages(prev => [...prev, userMessage])

        // Optimistic history update for new chats
        if (!chatHistory[currentChatId]) {
            setChatHistory(prev => ({
                ...prev,
                [currentChatId]: content.substring(0, 30) + (content.length > 30 ? '...' : '')
            }))
        }

        const aiMessageId = Date.now()
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: '',
            id: aiMessageId,
            isLoading: true
        }])

        try {
            // Construct message history for Ollama
            const historyForApi = messages.map(({ role, content }) => ({ role, content }))
            historyForApi.push({ role: 'user', content })

            const res = await fetch(`${API_BASE}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: currentModel,
                    messages: historyForApi,
                    stream: true
                }),
                signal: abortControllerRef.current.signal
            })

            if (!res.ok) throw new Error(`Server error: ${res.status}`)
            if (!res.body) throw new Error('No response body')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()
            let fullText = ''
            let buffer = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                buffer += chunk

                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const json = JSON.parse(line)

                        if (json.message && json.message.content) {
                            fullText += json.message.content
                            setMessages(prev => prev.map(msg =>
                                msg.id === aiMessageId
                                    ? { ...msg, content: fullText, isLoading: false }
                                    : msg
                            ))
                        }

                        if (json.done) {
                            const duration = (json.total_duration / 1e9).toFixed(2)
                            const evalDuration = (json.eval_duration / 1e9)
                            const speed = evalDuration > 0 ? (json.eval_count / evalDuration).toFixed(1) : '0'

                            setMessages(prev => prev.map(msg =>
                                msg.id === aiMessageId
                                    ? {
                                        ...msg,
                                        stats: {
                                            duration,
                                            tokens: json.eval_count,
                                            speed,
                                            model: json.model
                                        }
                                    }
                                    : msg
                            ))
                        }
                    } catch (e) {
                        // ignore parsing error for partial chunks
                    }
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error
                ? (error.name === 'AbortError' ? '⏹️ Generation stopped' : `❌ ${error.message}`)
                : '❌ An error occurred'

            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                    ? { ...msg, content: errorMessage, isLoading: false, isError: true }
                    : msg
            ))
        } finally {
            setIsGenerating(false)
            abortControllerRef.current = null
        }
    }, [currentModel, currentChatId, chatHistory, isGenerating, messages])

    return {
        messages,
        isGenerating,
        sendMessage,
        stopGeneration,
        createNewChat,
        chatHistory,
        currentChatId,
        switchChat,
        deleteHistory
    }
}
