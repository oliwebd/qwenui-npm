# Qwen Studio - chat UI Style

A beautiful, modern chat interface for Ollama models with Claude-inspired design. Switch between different AI models seamlessly!

## ✨ Features

- 🎨 **Claude-inspired UI** - Clean, modern, professional interface
- 🤖 **Multi-model support** - Switch between different Ollama models on-the-fly
- 📱 **Responsive design** - Works perfectly on desktop and mobile
- 💬 **Real-time streaming** - See responses as they're generated
- 🎯 **Code highlighting** - Beautiful syntax highlighting for code blocks
- 📋 **Copy code blocks** - One-click code copying
- 💾 **Chat history** - Keep track of your conversations (in-memory)

## 🚀 Quick Start

### Prerequisites

1. **Install Ollama** (if not already installed)
   ```bash
   # macOS
   brew install ollama
   
   # Linux
   curl -fsSL https://ollama.com/install.sh | sh
   
   # Windows
   # Download from https://ollama.com/download
   ```

2. **Pull your desired models**
   ```bash
   ollama pull qwen2.5-coder:1.5b
   ollama pull qwen3:0.6b
   ollama pull qwen2.5-coder:7b
   # ... or any other model you want
   ```

3. **Start Ollama**
   ```bash
   ollama serve
   ```

### Installation & Running

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:14000
   ```

That's it! 🎉

## 🤖 Supported Models

The interface comes pre-configured with popular coding models:

- **qwen2.5-coder:1.5b** - Fast, lightweight (default)
- **qwen3:0.6b** - Ultra-fast, smallest model
- **qwen2.5-coder:7b** - Balanced performance
- **qwen2.5-coder:14b** - High quality
- **qwen2.5-coder:32b** - Best quality (requires powerful hardware)
- **codellama:7b** - Meta's code model
- **deepseek-coder:6.7b** - DeepSeek's code model

You can add more models by:
1. Pulling them with Ollama: `ollama pull model-name`
2. Adding them to the dropdown in `qwen-coder-claude-ui.html`

## 🎨 Customization

### Adding New Models

Edit the `<select>` element in `qwen-coder-claude-ui.html`:

```html
<select id="model-select" onchange="changeModel()">
    <option value="your-model:tag">your-model:tag</option>
</select>
```

### Changing Colors

The design uses Tailwind CSS. Main colors:
- Background: `#0a0a0a`
- Sidebar: `#0f0f0f`
- Accent: Blue to Purple gradient
- Text: Zinc color palette

### Port Configuration

To change the port (default: 14000), update the last line in `server.js`:
```javascript
serve({ fetch: app.fetch, port: 14000 })
```

## 📱 Mobile Support

The interface is fully responsive with:
- Collapsible sidebar
- Touch-friendly controls
- Optimized text sizing
- Smooth animations

## 🔧 Troubleshooting

### "Cannot connect to server"
- Make sure the backend server is running: `npm start`
- Check that it's running on port 14000
- Verify no firewall is blocking the connection

### "Ollama offline" or connection errors
- Ensure Ollama is running: `ollama serve`
- Check Ollama is running on default port 11434
- Try `ollama list` to see available models

### Model not found
- Pull the model first: `ollama pull model-name`
- Check available models: `ollama list`
- Verify the model name matches exactly (including version tag)

### Slow responses
- Consider using smaller models (0.6b, 1.5b)
- Check your system resources (CPU/RAM/GPU usage)
- Ensure nothing else is using GPU/CPU heavily
- Try quantized models for faster inference

### Empty responses
- Some models may need specific prompting
- Try rephrasing your question
- Check Ollama logs for errors: `ollama logs`

## 📝 API Endpoints

### Health Check
```
GET /api/health
Response: {"status": "ok", "timestamp": "2024-..."}
```

### Chat
```
POST /api/chat
Body: {
  "message": "Your message",
  "chatId": 1234567890,
  "model": "qwen2.5-coder:1.5b"
}
Response: Streaming text/plain
```

## 🏗️ Tech Stack

- **Frontend**: Vanilla JS + Tailwind CSS
- **Backend**: Hono (Fast web framework for Node.js)
- **AI**: Ollama (Local LLM runtime)
- **Streaming**: Server-Sent Events via Hono streaming

## 🎯 Features Roadmap

- [ ] Persistent chat history with SQLite/file storage
- [ ] Export conversations (JSON, Markdown, PDF)
- [ ] Custom system prompts per model
- [ ] Temperature and parameter controls
- [ ] File upload support (code files, documents)
- [ ] Multi-language syntax highlighting
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Model performance metrics
- [ ] Auto-save drafts

## 📄 License

MIT License - Feel free to use and modify as needed!

## 🙏 Credits

- Design inspired by Claude AI by Anthropic
- Powered by Ollama
- Built with Hono and Tailwind CSS
- Icons from Lucide/Feather

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

**Enjoy coding with Qwen! 🚀**

Need help? Check out:
- [Ollama Documentation](https://ollama.ai/docs)
- [Hono Documentation](https://hono.dev)
- [Qwen Models](https://github.com/QwenLM)