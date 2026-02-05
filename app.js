// Configuration
const OLLAMA_API_BASE = 'http://localhost:11434';

// State
let currentChatId = Date.now();
let history = {};
let isGenerating = false;
let currentModel = 'qwen2.5-coder:1.5b';
let availableModels = [];
let abortController = null;
let currentTheme = 'light';

// ============================================================================
// Theme Management
// ============================================================================

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcons();
}

function updateThemeIcons() {
    const icons = [document.getElementById('theme-icon'), document.getElementById('theme-icon-mobile')];
    const text = document.getElementById('theme-text');
    
    if (currentTheme === 'dark') {
        icons.forEach(icon => {
            if (icon) {
                icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
            }
        });
        if (text) text.textContent = 'Light mode';
    } else {
        icons.forEach(icon => {
            if (icon) {
                icon.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
            }
        });
        if (text) text.textContent = 'Dark mode';
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', currentTheme);
    }
    updateThemeIcons();
}

// ============================================================================
// Mobile Viewport Management
// ============================================================================

function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function initializeMobileSupport() {
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Prevent body scroll when keyboard is open on mobile
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const textarea = document.getElementById('user-input');
        
        textarea.addEventListener('focus', function() {
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    }
}

// ============================================================================
// Ollama API Functions
// ============================================================================

async function loadModels() {
    const select = document.getElementById('model-select');
    const welcomeModel = document.getElementById('welcome-model');
    
    try {
        const res = await fetch(`${OLLAMA_API_BASE}/api/tags`);
        if (res.ok) {
            const data = await res.json();
            availableModels = data.models || [];
            
            if (availableModels.length > 0) {
                select.innerHTML = availableModels.map(m => 
                    `<option value="${m.name}">${m.name}</option>`
                ).join('');
                
                currentModel = availableModels[0].name;
                select.value = currentModel;
                if (welcomeModel) welcomeModel.textContent = currentModel;
            } else {
                throw new Error('No models found');
            }
        } else {
            throw new Error('Failed to fetch models');
        }
    } catch (e) {
        console.error('Error loading models:', e);
        select.innerHTML = `
            <option value="qwen2.5-coder:1.5b">qwen2.5-coder:1.5b</option>
            <option value="qwen2.5-coder:7b">qwen2.5-coder:7b</option>
            <option value="llama3.2:latest">llama3.2:latest</option>
        `;
        currentModel = 'qwen2.5-coder:1.5b';
        if (welcomeModel) welcomeModel.textContent = currentModel;
        showNotification('Failed to load models. Using defaults.', 'warning');
    }
}

async function refreshModels() {
    const select = document.getElementById('model-select');
    select.disabled = true;
    select.innerHTML = '<option>Refreshing...</option>';
    await loadModels();
    select.disabled = false;
    showNotification('Models refreshed', 'success');
}

async function checkStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text-desktop');
    const statusDotDesktop = document.getElementById('status-dot-desktop');
    
    try {
        // Use a lightweight HEAD request to check if server is up
        const res = await fetch(`${OLLAMA_API_BASE}/`, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(3000)
        });
        
        if (res.ok || res.status === 404) { // 404 is fine, means server is running
            const statusColor = '#34a853';
            const modelCount = availableModels.length; // Use cached count
            
            if (statusDot) {
                statusDot.style.background = statusColor;
                statusDot.style.boxShadow = `0 0 8px ${statusColor}`;
                statusDot.classList.remove('status-pulse');
            }
            if (statusDotDesktop) {
                statusDotDesktop.style.background = statusColor;
                statusDotDesktop.style.boxShadow = `0 0 8px ${statusColor}`;
                statusDotDesktop.classList.remove('status-pulse');
            }
            if (statusText) {
                statusText.textContent = `Online • ${modelCount} models`;
                statusText.style.color = statusColor;
            }
        } else {
            throw new Error('Ollama disconnected');
        }
    } catch (e) {
        console.error('Status check error:', e);
        const statusColor = '#ea4335';
        if (statusDot) {
            statusDot.style.background = statusColor;
            statusDot.style.boxShadow = `0 0 8px ${statusColor}`;
            statusDot.classList.add('status-pulse');
        }
        if (statusDotDesktop) {
            statusDotDesktop.style.background = statusColor;
            statusDotDesktop.style.boxShadow = `0 0 8px ${statusColor}`;
            statusDotDesktop.classList.add('status-pulse');
        }
        if (statusText) {
            statusText.textContent = 'Offline';
            statusText.style.color = statusColor;
        }
    }
}

// ============================================================================
// UI Helper Functions
// ============================================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'success-container',
        error: 'error-container',
        warning: 'error-container',
        info: 'success-container'
    };
    
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 ${colors[type]} px-4 py-2.5 rounded-lg shadow-lg text-sm z-50 fade-in font-medium`;
    notification.innerHTML = `
        <div class="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
            </svg>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -10px)';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

function changeModel() {
    const select = document.getElementById('model-select');
    currentModel = select.value;
    
    const welcomeModel = document.getElementById('welcome-model');
    if (welcomeModel) {
        welcomeModel.textContent = currentModel;
    }
    
    showNotification(`Switched to ${currentModel}`, 'success');
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('hidden');
}

function createNewChat() {
    currentChatId = Date.now();
    const chatWindow = document.getElementById('chat-window');
    const displayModel = currentModel || 'qwen2.5-coder:1.5b';
    
    chatWindow.innerHTML = `
        <div class="max-w-3xl mx-auto h-full flex items-center justify-center">
            <div class="text-center px-4 -mt-20">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 shadow-lg" style="background: linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%)">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <polyline points="16 18 22 12 16 6"></polyline>
                        <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                </div>
                <h2 class="text-3xl md:text-4xl font-semibold mb-3 tracking-tight" style="color: var(--text-primary)">Qwen Studio</h2>
                <p class="text-base md:text-lg mb-2" style="color: var(--text-secondary)">Chat with AI models powered by Ollama</p>
                <p class="text-sm" style="color: var(--text-tertiary)">Model: <span class="font-medium" style="color: var(--text-secondary)">${displayModel}</span></p>
            </div>
        </div>`;
    document.getElementById('user-input').value = '';
    document.getElementById('user-input').style.height = 'auto';
    
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

function updateSidebar() {
    const list = document.getElementById('chat-list');
    list.innerHTML = Object.keys(history).reverse().map(id => `
        <div class="text-sm p-2.5 rounded-lg cursor-pointer truncate transition-all ${id == currentChatId ? 'font-medium' : ''}" 
             style="background: ${id == currentChatId ? 'var(--bg-hover)' : 'transparent'}; color: ${id == currentChatId ? 'var(--text-primary)' : 'var(--text-secondary)'}"
             onclick="switchChat(${id})"
             onmouseover="if(${id} != ${currentChatId}) { this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)'; }"
             onmouseout="if(${id} != ${currentChatId}) { this.style.background='transparent'; this.style.color='var(--text-secondary)'; }">
            <div class="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flex-shrink-0 opacity-50">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span class="truncate">${escapeHtml(history[id])}</span>
            </div>
        </div>
    `).join('');
}

function switchChat(chatId) {
    currentChatId = chatId;
    updateSidebar();
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

// ============================================================================
// Chat Functions
// ============================================================================

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

async function sendMessage() {
    if (isGenerating) {
        stopGeneration();
        return;
    }
    
    const input = document.getElementById('user-input');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('send-btn');
    const msg = input.value.trim();
    if (!msg) return;

    isGenerating = true;
    abortController = new AbortController();
    
    // Update button to stop button
    sendBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"></rect></svg>`;
    sendBtn.className = sendBtn.className.replace('bg-', 'stop-btn ');

    // Clear welcome screen
    if (chatWindow.querySelector('.text-center')) {
        chatWindow.innerHTML = '<div class="py-8"></div>';
    }

    // Update sidebar
    if (!history[currentChatId]) {
        history[currentChatId] = msg.substring(0, 30) + (msg.length > 30 ? '...' : '');
        updateSidebar();
    }

    // User Message
    const userMsg = document.createElement('div');
    userMsg.className = "max-w-3xl mx-auto py-6 message-bubble";
    userMsg.innerHTML = `
        <div class="flex gap-3 md:gap-4 items-start px-2 md:px-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-md" style="background: linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%); color: white;">
                U
            </div>
            <div class="flex-1 pt-1">
                <div class="text-[15px] md:text-[15px] leading-relaxed break-words" style="color: var(--text-primary)">${escapeHtml(msg)}</div>
            </div>
        </div>`;
    chatWindow.appendChild(userMsg);
    
    input.value = '';
    input.style.height = 'auto';

    // AI Message with typing indicator
    const aiMsg = document.createElement('div');
    aiMsg.className = "max-w-3xl mx-auto py-6 message-bubble";
    aiMsg.style.borderTop = `1px solid var(--border-color)`;
    aiMsg.innerHTML = `
        <div class="flex gap-3 md:gap-4 items-start px-2 md:px-4">
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shadow-md" style="background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); color: white;">
                Q
            </div>
            <div class="flex-1 pt-1">
                <div class="ai-content text-[15px] md:text-[15px] leading-relaxed">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        </div>`;
    chatWindow.appendChild(aiMsg);
    const contentDiv = aiMsg.querySelector('.ai-content');

    chatWindow.scrollTop = chatWindow.scrollHeight;

    try {
        const res = await fetch(`${OLLAMA_API_BASE}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                model: currentModel,
                prompt: msg,
                stream: true
            }),
            signal: abortController.signal
        });

        if (!res.ok) {
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }

        if (!res.body) {
            throw new Error('No response body from server');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let hasData = false;
        let lastUpdateTime = Date.now();

        contentDiv.innerHTML = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            hasData = true;
            const chunk = decoder.decode(value, { stream: true });
            
            // Parse Ollama streaming response
            const lines = chunk.split('\n').filter(line => line.trim());
            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        fullText += json.response;
                    }
                    if (json.done && json.done === true) {
                        break;
                    }
                } catch (e) {
                    console.error('JSON parse error:', e);
                }
            }
            
            // Update UI every 50ms for smooth streaming
            const now = Date.now();
            if (now - lastUpdateTime > 50) {
                contentDiv.innerHTML = parseMarkdown(fullText);
                chatWindow.scrollTop = chatWindow.scrollHeight;
                lastUpdateTime = now;
            }
        }

        // Final update
        contentDiv.innerHTML = parseMarkdown(fullText);
        
        if (!hasData || fullText.trim() === "") {
            throw new Error('No response received from model');
        }

    } catch (error) {
        console.error('Error:', error);
        
        if (error.name === 'AbortError') {
            contentDiv.innerHTML = `<div class="error-container rounded-lg p-4">
                <div class="flex items-center gap-2 font-medium mb-1">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    Generation Stopped
                </div>
                <p class="text-sm">Response generation was cancelled.</p>
            </div>`;
        } else {
            let errorMsg = "";
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                errorMsg = `<div class="error-container rounded-lg p-4">
                    <div class="flex items-center gap-2 font-medium mb-2">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        Cannot Connect to Ollama
                    </div>
                    <p class="text-sm mb-3">Please check:</p>
                    <ul class="text-sm list-disc list-inside space-y-1">
                        <li>Ollama is running on localhost:11434</li>
                        <li>Run: <code class="px-1.5 py-0.5 rounded text-xs font-mono" style="background: var(--code-bg); border: 1px solid var(--code-border)">ollama serve</code></li>
                        <li>Model "${currentModel}" is installed</li>
                        <li>CORS is enabled (OLLAMA_ORIGINS=*)</li>
                    </ul>
                </div>`;
            } else if (error.message.includes('No response')) {
                errorMsg = `<div class="error-container rounded-lg p-4">
                    <div class="flex items-center gap-2 font-medium mb-2">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Empty Response
                    </div>
                    <p class="text-sm">The model did not generate a response. Try:</p>
                    <ul class="text-sm list-disc list-inside mt-2 space-y-1">
                        <li>Pulling the model: <code class="px-1.5 py-0.5 rounded text-xs font-mono" style="background: var(--code-bg); border: 1px solid var(--code-border)">ollama pull ${currentModel}</code></li>
                        <li>Using a different model</li>
                        <li>Rephrasing your question</li>
                    </ul>
                </div>`;
            } else {
                errorMsg = `<div class="error-container rounded-lg p-4">
                    <div class="flex items-center gap-2 font-medium mb-2">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Error
                    </div>
                    <p class="text-sm">${escapeHtml(error.message)}</p>
                </div>`;
            }
            
            contentDiv.innerHTML = errorMsg;
        }
    } finally {
        isGenerating = false;
        abortController = null;
        
        // Reset button
        sendBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m5 12 7-7 7 7"/>
            <path d="M12 19V5"/>
        </svg>`;
        sendBtn.className = sendBtn.className.replace('stop-btn', '').trim();
        sendBtn.style.background = 'var(--accent-primary)';
        
        input.focus();
    }
}

function stopGeneration() {
    if (abortController) {
        abortController.abort();
        showNotification('Generation stopped', 'info');
    }
}

// ============================================================================
// Markdown Parsing & Utilities
// ============================================================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function parseMarkdown(text) {
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        const language = lang || 'code';
        return `<div class="code-container">
            <div class="code-header">
                <span class="text-xs font-medium" style="color: var(--text-secondary)">${language}</span>
                <button class="copy-btn" onclick="copyCode(this)">Copy code</button>
            </div>
            <pre><code>${code.trim()}</code></pre>
        </div>`;
    });
    
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-[13px] font-mono" style="background: var(--code-bg); border: 1px solid var(--code-border); color: var(--text-primary)">$1</code>');
    
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold" style="color: var(--text-primary)">$1</strong>');
    
    // Italic
    text = text.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    
    // Headers
    text = text.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2" style="color: var(--text-primary)">$1</h3>');
    text = text.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-6 mb-3" style="color: var(--text-primary)">$1</h2>');
    text = text.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4" style="color: var(--text-primary)">$1</h1>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

function copyCode(btn) {
    const code = btn.closest('.code-container').querySelector('pre').innerText;
    navigator.clipboard.writeText(code).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
        btn.style.color = '#34a853';
        btn.style.borderColor = '#34a853';
        
        setTimeout(() => {
            btn.innerHTML = original;
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        showNotification('Copy failed', 'error');
    });
}

// ============================================================================
// Auto-resize Textarea
// ============================================================================

function initializeTextarea() {
    const textarea = document.getElementById('user-input');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        const newHeight = Math.min(this.scrollHeight, 160);
        this.style.height = newHeight + 'px';
    });
}

// ============================================================================
// Initialization
// ============================================================================

function initialize() {
    initializeTheme();
    initializeMobileSupport();
    initializeTextarea();
    loadModels();
    checkStatus();
    // Check status every 60 seconds (less frequent, and doesn't call /api/tags)
    setInterval(checkStatus, 60000);
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}