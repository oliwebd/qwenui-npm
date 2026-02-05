import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { readFileSync } from 'fs'
import { stream } from 'hono/streaming'
import ollama from 'ollama'
import { serveStatic } from '@hono/node-server/serve-static'

const app = new Hono()

// CORS configuration
app.use('/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
}))

// Serve index.html at the root path
app.get('/', (c) => {
    try {
        const html = readFileSync('./index.html', 'utf-8')
        return c.html(html)
    } catch (e) {
        console.error('Error loading index.html:', e.message)
        return c.text('Error loading index.html: ' + e.message, 500)
    }
})

app.use('/static/*', serveStatic({ root: './' })) 
// Or just serve the specific files if they are in the root
app.get('/app.js', serveStatic({ path: './app.js' }))
app.get('/styles.css', serveStatic({ path: './styles.css' }))


// Health check endpoint with Ollama connectivity check
app.get('/api/health', async (c) => {
    try {
        const models = await ollama.list()
        return c.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            ollama: 'connected',
            modelCount: models.models?.length || 0
        })
    } catch (e) {
        return c.json({ 
            status: 'degraded', 
            timestamp: new Date().toISOString(),
            ollama: 'disconnected',
            error: e.message
        }, 503)
    }
})

// Get available models from Ollama
app.get('/api/models', async (c) => {
    try {
        const models = await ollama.list()
        const modelList = models.models.map(m => ({
            name: m.name,
            size: m.size,
            modified: m.modified_at
        }))
        return c.json({ models: modelList })
    } catch (e) {
        console.error('Error fetching models:', e.message)
        return c.json({ 
            error: 'Cannot fetch models from Ollama',
            message: e.message 
        }, 500)
    }
})

// Memory store for chat history
let chatSessions = {}

// Cleanup old sessions (older than 1 hour)
setInterval(() => {
    const oneHourAgo = Date.now() - 3600000
    for (const chatId in chatSessions) {
        if (chatSessions[chatId].lastActivity < oneHourAgo) {
            delete chatSessions[chatId]
            console.log(`🧹 Cleaned up inactive session: ${chatId}`)
        }
    }
}, 300000) // Run every 5 minutes

app.post('/api/chat', async (c) => {
    let streamStarted = false
    
    try {
        const body = await c.req.json()
        const { message, chatId, model = 'qwen2.5-coder:1.5b' } = body
        
        // Validation
        if (!message || message.trim() === '') {
            return c.json({ error: 'Message cannot be empty' }, 400)
        }
        
        if (!chatId) {
            return c.json({ error: 'Chat ID is required' }, 400)
        }
        
        // Initialize or update chat session
        if (!chatSessions[chatId]) {
            chatSessions[chatId] = {
                messages: [],
                lastActivity: Date.now(),
                model: model
            }
        }
        
        chatSessions[chatId].messages.push({ role: 'user', content: message })
        chatSessions[chatId].lastActivity = Date.now()
        chatSessions[chatId].model = model
        
        console.log(`[${new Date().toISOString()}] [Chat ${chatId}] Model: ${model}`)
        console.log(`[${new Date().toISOString()}] [Chat ${chatId}] User: ${message.substring(0, 80)}${message.length > 80 ? '...' : ''}`)
        
        return stream(c, async (stream) => {
            streamStarted = true
            let fullReply = ""
            let tokenCount = 0
            const startTime = Date.now()
            
            try {
                // Verify model exists
                try {
                    const modelList = await ollama.list()
                    const availableModels = modelList.models.map(m => m.name)
                    
                    if (!availableModels.includes(model)) {
                        const errorMsg = `❌ Model '${model}' not found.\n\nAvailable models:\n${availableModels.map(m => `  • ${m}`).join('\n')}\n\nTo install: ollama pull ${model}`
                        await stream.write(errorMsg)
                        return
                    }
                } catch (listError) {
                    console.error(`[Chat ${chatId}] Error listing models:`, listError.message)
                }
                
                console.log(`[Chat ${chatId}] Calling Ollama API...`)
                
                const response = await ollama.chat({
                    model: model,
                    messages: chatSessions[chatId].messages,
                    stream: true,
                    options: {
                        temperature: 0.7,
                        num_predict: 2048,
                    }
                })
                
                for await (const part of response) {
                    if (part.message && part.message.content) {
                        const content = part.message.content
                        fullReply += content
                        tokenCount++
                        await stream.write(content)
                    }
                    
                    if (part.error) {
                        throw new Error(part.error)
                    }
                }
                
                const duration = ((Date.now() - startTime) / 1000).toFixed(2)
                
                if (fullReply.trim() === '') {
                    console.warn(`[Chat ${chatId}] Empty response`)
                    await stream.write("\n\n⚠️ Empty response. Please try again.")
                } else {
                    chatSessions[chatId].messages.push({ role: 'assistant', content: fullReply })
                    chatSessions[chatId].lastActivity = Date.now()
                    console.log(`[Chat ${chatId}] ✓ ${fullReply.length} chars, ${duration}s`)
                }
                
            } catch (e) {
                console.error(`[Chat ${chatId}] Error:`, e.message)
                
                let errorMsg = ""
                if (e.message.includes('ECONNREFUSED')) {
                    errorMsg = `❌ Cannot connect to Ollama.\n\nStart Ollama: ollama serve`
                } else if (e.message.includes('not found')) {
                    errorMsg = `❌ Model not found.\n\nInstall: ollama pull ${model}`
                } else if (e.message.includes('timeout')) {
                    errorMsg = `❌ Request timeout. Try a smaller model.`
                } else if (e.message.includes('memory')) {
                    errorMsg = `❌ Out of memory. Use a smaller model.`
                } else {
                    errorMsg = `❌ Error: ${e.message}`
                }
                
                await stream.write(errorMsg)
            }
        })
    } catch (e) {
        console.error('API error:', e)
        if (!streamStarted) {
            return c.json({ error: 'Internal server error', message: e.message }, 500)
        }
    }
})

// Delete chat session
app.delete('/api/chat/:chatId', (c) => {
    const chatId = c.req.param('chatId')
    if (chatSessions[chatId]) {
        delete chatSessions[chatId]
        console.log(`🗑️  Cleared chat: ${chatId}`)
        return c.json({ success: true })
    }
    return c.json({ success: false }, 404)
})

app.onError((err, c) => {
    console.error('Server error:', err)
    return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

app.notFound((c) => {
    return c.json({ error: 'Not Found', path: c.req.path }, 404)
})

const PORT = process.env.PORT || 14000

console.log(`
╔═════════════════════════════════════╗
║   🚀 Qwen Coder Studio                     ║
╚═════════════════════════════════════╝
📍 http://localhost:${PORT}
📝 Ollama: ollama serve
🤖 Models: ollama list
`)

serve({ fetch: app.fetch, port: PORT })