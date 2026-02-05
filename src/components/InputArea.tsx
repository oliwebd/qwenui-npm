import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react'
import { ArrowUp, Square, Paperclip, Mic, ChevronDown } from 'lucide-react'
import type { Model } from '../types'

interface InputAreaProps {
    onSend: (message: string) => void
    onStop: () => void
    isGenerating: boolean
    models: Model[]
    currentModel: string
    onModelChange: (model: string) => void
}

export default function InputArea({
    onSend,
    onStop,
    isGenerating,
    models,
    currentModel,
    onModelChange
}: InputAreaProps) {
    const [message, setMessage] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = () => {
        if (isGenerating) {
            onStop()
        } else if (message.trim()) {
            onSend(message)
            setMessage('')
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        }
    }

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }

    return (
        <div className="p-4 md:p-6 bg-gradient-to-t from-slate-100/80 dark:from-slate-900/80 to-transparent backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
                {/* Model Selector Pill */}
                <div className="flex justify-center mb-3">
                    <div className="relative group">
                        <select
                            value={currentModel}
                            onChange={(e) => onModelChange(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-medium
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-600 dark:text-slate-300
                hover:border-indigo-300 dark:hover:border-indigo-500/50
                hover:text-indigo-600 dark:hover:text-indigo-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                shadow-sm transition-all cursor-pointer"
                        >
                            {models.map(m => (
                                <option key={m.name} value={m.name}>{m.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                </div>

                <div className="relative flex items-end gap-3 rounded-2xl p-2 
          bg-white dark:bg-slate-800 
          border border-slate-200 dark:border-slate-700
          shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50
          focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500
          transition-all duration-200">

                    {/* Attachment button (decorative for now) */}
                    <button
                        className="hidden md:flex p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 
              hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        title="Attach file"
                    >
                        <Paperclip size={20} />
                    </button>

                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInput}
                        onKeyDown={handleKeyPress}
                        rows={1}
                        className="flex-1 bg-transparent outline-none px-3 py-3 
              resize-none text-[15px] max-h-[200px] leading-relaxed
              text-slate-800 dark:text-slate-100 
              placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        placeholder={`Message ${currentModel}...`}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />

                    {/* Voice input button (decorative for now) */}
                    <button
                        className="hidden md:flex p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 
              hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        title="Voice input"
                    >
                        <Mic size={20} />
                    </button>

                    {/* Send/Stop button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isGenerating && !message.trim()}
                        className={`
              p-3 rounded-xl transition-all duration-200 shrink-0 
              disabled:opacity-30 disabled:cursor-not-allowed 
              active:scale-95 shadow-lg
              ${isGenerating
                                ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-red-500/25'
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/25'
                            }
              text-white
            `}
                        aria-label={isGenerating ? 'Stop generation' : 'Send message'}
                    >
                        {isGenerating ? (
                            <Square size={20} fill="currentColor" />
                        ) : (
                            <ArrowUp size={20} strokeWidth={2.5} />
                        )}
                    </button>
                </div>

                <div className="flex items-center justify-between mt-3 px-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px]">Shift+Enter</kbd> for new line
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 hidden md:block">
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </div>
    )
}
