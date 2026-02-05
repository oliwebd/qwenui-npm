export function escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

export function parseMarkdown(text: string): string {
    if (!text) return ''

    // Escape HTML first
    let result = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // Code blocks with syntax highlighting placeholder
    result = result.replace(/```(\w+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
        const language = lang || 'code'
        return `
      <div class="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">${language}</span>
          <button 
            onclick="navigator.clipboard.writeText(this.closest('div').nextElementSibling.innerText).then(() => { this.innerHTML = '✓ Copied'; setTimeout(() => this.innerHTML = 'Copy', 2000); })" 
            class="text-xs font-medium px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >Copy</button>
        </div>
        <pre class="p-4 overflow-x-auto bg-slate-50 dark:bg-slate-900"><code class="text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed">${code.trim()}</code></pre>
      </div>
    `
    })

    // Inline code
    result = result.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md text-sm font-mono bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">$1</code>')

    // Bold
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>')

    // Italic
    result = result.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

    // Headers
    result = result.replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-3 text-slate-800 dark:text-slate-100">$1</h3>')
    result = result.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-4 text-slate-800 dark:text-slate-100">$1</h2>')
    result = result.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4 text-slate-800 dark:text-slate-100">$1</h1>')

    // Lists
    result = result.replace(/^- (.+)$/gm, '<li class="ml-4 text-slate-700 dark:text-slate-300">$1</li>')
    result = result.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-slate-700 dark:text-slate-300">$2</li>')

    // Line breaks
    result = result.replace(/\n/g, '<br>')

    return result
}
