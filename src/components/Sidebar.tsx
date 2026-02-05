import { MessageSquare, X, Plus, RefreshCw, Sun, Moon, Sparkles, Trash2 } from 'lucide-react'
import type { Model, ChatHistory, Status } from '../types'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
    theme: 'light' | 'dark'
    toggleTheme: () => void
    models: Model[]
    currentModel: string
    onModelChange: (model: string) => void
    onRefreshModels: () => void
    onNewChat: () => void
    chatHistory: ChatHistory
    currentChatId: number
    onSwitchChat: (id: number) => void
    onDeleteChat: (id: number) => void
    status: Status
}

export default function Sidebar({
    isOpen,
    onClose,
    theme,
    toggleTheme,
    models,
    currentModel,
    onModelChange,
    onRefreshModels,
    onNewChat,
    chatHistory,
    currentChatId,
    onSwitchChat,
    onDeleteChat,
    status
}: SidebarProps) {
    return (
        <aside
            className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-72 flex flex-col h-full
        bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950
        border-r border-slate-200/80 dark:border-slate-700/50
        shadow-xl md:shadow-none
        transform transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
        >
            {/* Sidebar Header */}
            <div className="p-5 border-b border-slate-200/80 dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                            Qwen Studio
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Model Selection */}
                <div className="mb-4">
                    <label className="text-xs font-semibold uppercase tracking-wider mb-2 block text-slate-500 dark:text-slate-400">
                        Model
                    </label>
                    <div className="relative">
                        <select
                            value={currentModel}
                            onChange={(e) => onModelChange(e.target.value)}
                            className="w-full py-3 px-4 pr-10 rounded-xl text-sm font-medium
                bg-white dark:bg-slate-800/80
                border border-slate-200 dark:border-slate-700
                text-slate-700 dark:text-slate-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                cursor-pointer appearance-none transition-all
                shadow-sm hover:shadow-md"
                        >
                            {models.length > 0 ? (
                                models.map(m => (
                                    <option key={m.name} value={m.name}>{m.name}</option>
                                ))
                            ) : (
                                <option value="">Loading models...</option>
                            )}
                        </select>
                        <svg
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                    <button
                        onClick={onRefreshModels}
                        className="mt-3 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400
              transition-colors flex items-center gap-1.5 group"
                    >
                        <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                        Refresh models
                    </button>
                </div>

                <button
                    onClick={onNewChat}
                    className="w-full py-3 px-4 rounded-xl text-sm font-semibold
            bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
            text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40
            transition-all duration-200 active:scale-[0.98]"
                >
                    <span className="flex items-center justify-center gap-2">
                        <Plus size={18} strokeWidth={2.5} />
                        New Chat
                    </span>
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-3">
                <p className="text-xs font-semibold uppercase tracking-wider mb-3 px-2 text-slate-400 dark:text-slate-500">
                    Recent Chats
                </p>
                {Object.keys(chatHistory).length === 0 ? (
                    <div className="text-center py-8 px-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto mb-3 flex items-center justify-center">
                            <MessageSquare size={20} className="text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No chats yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Start a conversation!</p>
                    </div>
                ) : (
                    Object.keys(chatHistory).reverse().map(id => (
                        <div
                            key={id}
                            onClick={() => onSwitchChat(Number(id))}
                            className={`
                text-sm p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1.5
                flex items-center justify-between group
                ${Number(id) === currentChatId
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                                }
              `}
                        >
                            <div className="flex items-center gap-3 truncate">
                                <MessageSquare size={16} className={`flex-shrink-0 ${Number(id) === currentChatId ? 'text-indigo-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <span className="truncate">{chatHistory[Number(id)]}</span>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteChat(Number(id))
                                }}
                                className={`
                  p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                  ${Number(id) === currentChatId
                                        ? 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-500'
                                        : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500'
                                    }
                `}
                                title="Delete chat"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Settings (desktop) */}
            <div className="hidden md:block p-4 border-t border-slate-200/80 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium
            text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800
            transition-all duration-200 shadow-sm hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                    {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
                    <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </button>

                <div className="flex items-center gap-2.5 mt-4 px-3">
                    <div
                        className={`w-2.5 h-2.5 rounded-full transition-all ${status.online
                                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                                : 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                            }`}
                    />
                    <span className={`text-xs font-medium ${status.online ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {status.loading ? 'Connecting...' : status.online ? `Connected • ${status.modelCount || 0} models` : 'Disconnected'}
                    </span>
                </div>
            </div>
        </aside>
    )
}
