# Qwen Studio 🚀

A polished, modern AI-powered coding assistant built leveraging local LLMs via Ollama. It features a beautiful, responsive UI inspired by top-tier AI platforms, refined with TypeScript and React.

## ✨ Features

- **🛡️ Modern Tech Stack**: Built with React, TypeScript, Vite, and Tailwind CSS v4.
- **🎨 Beautiful UI**: Glassmorphism, smooth gradients, and typography.
- **📱 Fully Responsive**: Optimized for both desktop and mobile devices.
- **🌙 Dark/Light Mode**: Seamless theme switching with system preference detection.
- **💾 Persistent History**: Auto-saves conversations locally using IndexedDB.
- **⚡ Real-time Streaming**: Instant response streaming directly from local Ollama.
- **📊 Generation Stats**: See token count, speed (t/s), and duration for every response.
- **📱 PWA Support**: Installable as a native-like app on your device.
- **📝 Markdown Support**: Full code syntax highlighting and copy-to-clipboard functionality.
- **🎛️ Model Switching**: Easily switch between installed Ollama models on the fly.

## 🚀 Quick Start

### Prerequisites

1.  **Ollama**: Ensure [Ollama](https://ollama.com/) is installed and running.
    ```bash
    ollama serve
    ```
2.  **Node.js**: Version 18+ recommended.

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project folder.

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

2.  **Open your browser**: Navigate to `http://localhost:5173`

## 🏗️ Architecture

-   **Frontend**: React (TypeScript), Vite, Tailwind CSS, IDB (IndexedDB wrapper).
-   **AI Engine**: Ollama (Local LLM), accessed via Vite development proxy.
-   **Storage**: Browser's IndexedDB for chat history persistence.

## 🛠️ Configuration

-   **Proxy**: The Vite dev server proxies `/api` to `http://localhost:11434/api` to communicate with Ollama directly.
-   **Models**: The app automatically fetches available models from your local Ollama instance.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License.