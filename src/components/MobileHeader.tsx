import { Menu, Sun, Moon, Sparkles } from 'lucide-react'
import type { Status } from '../types'

interface MobileHeaderProps {
    onMenuClick: () => void
    theme: 'light' | 'dark'
    toggleTheme: () => void
    status: Status
}

export default function MobileHeader({ onMenuClick, theme, toggleTheme, status }: MobileHeaderProps) {
    return (
        <div className="md:hidden p-4 flex items-center justify-between flex-shrink-0 
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-md
      border-b border-slate-200/80 dark:border-slate-700/50
      sticky top-0 z-40">
            <button
                onClick={onMenuClick}
                className="p-2.5 -ml-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
                <Menu size={22} />
            </button>

            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Sparkles size={14} className="text-white" />
                </div>
                <h1 className="font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Qwen Studio
                </h1>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                    {theme === 'dark' ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-indigo-500" />}
                </button>

                <div
                    className={`w-2.5 h-2.5 rounded-full transition-all ${status.online
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                            : 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse'
                        }`}
                />
            </div>
        </div>
    )
}
