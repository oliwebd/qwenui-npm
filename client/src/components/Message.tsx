import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { parseMarkdown } from '../utils/markdown'
import type { Message as MessageType } from '../types'

interface MessageProps {
    message: MessageType
}

export default function Message({ message }: MessageProps) {
    const [copied, setCopied] = useState(false)
    const isUser = message.role === 'user'

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className={`group py-6 ${!isUser ? 'bg-slate-50/50 dark:bg-slate-800/30 -mx-4 md:-mx-6 px-4 md:px-6 border-y border-slate-100 dark:border-slate-800' : ''}`}>
            <div className="flex gap-4 items-start max-w-3xl mx-auto">
                {/* Avatar */}
                <div
                    className={`
            flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center 
            shadow-lg transition-transform group-hover:scale-105
            ${isUser
                            ? 'bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800'
                            : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                        }
          `}
                >
                    {isUser ? (
                        <User size={20} className="text-white" />
                    ) : (
                        <Bot size={20} className="text-white" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-semibold ${isUser ? 'text-slate-700 dark:text-slate-200' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {isUser ? 'You' : 'Qwen'}
                        </span>
                        {!isUser && !message.isLoading && (
                            <button
                                onClick={handleCopy}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                title="Copy response"
                            >
                                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                        )}
                    </div>

                    {message.isLoading ? (
                        <div className="flex items-center gap-1.5 py-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    ) : isUser ? (
                        <div className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                            {message.content}
                        </div>
                    ) : (
                        <>
                            <div
                                className={`prose prose-slate dark:prose-invert prose-sm max-w-none 
                ${message.isError ? 'text-red-500 dark:text-red-400' : ''}`}
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                            />
                            {message.stats && (
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider font-mono">
                                    <span className="text-indigo-500/80 dark:text-indigo-400/80">{message.stats.model}</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span>{message.stats.duration}s</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span>{message.stats.tokens} tokens</span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span>{message.stats.speed} t/s</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
