import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputArea from './components/InputArea'
import MobileHeader from './components/MobileHeader'
import { useTheme } from './hooks/useTheme'
import { useChat } from './hooks/useChat'
import { useModels } from './hooks/useModels'

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { theme, toggleTheme } = useTheme()
    const { models, currentModel, setCurrentModel, refreshModels, status } = useModels()
    const {
        messages,
        isGenerating,
        sendMessage,
        stopGeneration,
        createNewChat,
        chatHistory,
        currentChatId,
        switchChat,
        deleteHistory,
    } = useChat(currentModel)

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev)
    }, [])

    return (
        <div className="flex h-screen bg-white dark:bg-slate-950">
            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={toggleSidebar}
                theme={theme}
                toggleTheme={toggleTheme}
                models={models}
                currentModel={currentModel}
                onModelChange={setCurrentModel}
                onRefreshModels={refreshModels}
                onNewChat={createNewChat}
                chatHistory={chatHistory}
                currentChatId={currentChatId}
                onSwitchChat={switchChat}
                onDeleteChat={deleteHistory}
                status={status}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Mobile Header */}
                <MobileHeader
                    onMenuClick={toggleSidebar}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    status={status}
                />

                {/* Chat Window */}
                <ChatWindow
                    messages={messages}
                    currentModel={currentModel}
                    isGenerating={isGenerating}
                />

                {/* Input Area */}
                <InputArea
                    onSend={sendMessage}
                    onStop={stopGeneration}
                    isGenerating={isGenerating}
                    models={models}
                    currentModel={currentModel}
                    onModelChange={setCurrentModel}
                />
            </main>
        </div>
    )
}

export default App
