import { useRef, useEffect } from 'react'
import { Sparkles, Code2 } from 'lucide-react'
import Message from './Message'
import type { Message as MessageType } from '../types'

interface ChatWindowProps {
    messages: MessageType[]
    currentModel: string
    isGenerating: boolean
}

export default function ChatWindow({ messages, currentModel }: ChatWindowProps) {
    const chatWindowRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTo({
                top: chatWindowRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages])

    if (messages.length === 0) {
        return (
            <div
                ref={chatWindowRef}
                className="flex-1 overflow-y-auto px-4 md:px-6"
            >
                <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
                    <div className="text-center px-4 -mt-16">
                        {/* Animated Logo */}
                        <div className="relative inline-block mb-8">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulse" />
                            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                                <Code2 size={40} className="text-white" strokeWidth={1.5} />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Sparkles size={24} className="text-amber-400 animate-bounce" />
                            </div>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                                Qwen Studio
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl mb-3 text-slate-600 dark:text-slate-300 font-medium">
                            Local LLM by Ollama support chatbot
                        </p>

                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                            Powered by{' '}
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                {currentModel}
                            </span>
                        </p>

                        {/* Quick suggestions */}
                        <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                            {['Explain this code', 'Write a function', 'Debug my error', 'Optimize performance'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    className="px-4 py-2 rounded-full text-sm font-medium
                    bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                    hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400
                    border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500/50
                    transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={chatWindowRef}
            className="flex-1 overflow-y-auto px-4 md:px-6 scroll-smooth"
        >
            <div className="py-6 max-w-4xl mx-auto">
                {messages.map((message, index) => (
                    <Message key={message.id || index} message={message} />
                ))}
            </div>
        </div>
    )
}
