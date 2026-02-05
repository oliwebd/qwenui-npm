# Qwen Studio 🚀

A polished, modern AI-powered coding assistant built leveraging local LLMs via Ollama. It features a beautiful, responsive UI inspired by top-tier AI platforms, refined with TypeScript and React.

![Qwen Studio](https://via.placeholder.com/1200x600?text=Qwen+Studio+Interface)

## ✨ Features

- **🛡️ Modern Tech Stack**: Built with React, TypeScript, Vite, and Tailwind CSS v4.
- **🎨 Beautiful UI**: Glassmorphism, smooth gradients, and Inter typography.
- **📱 Fully Responsive**: Optimized for both desktop and mobile devices.
- **🌙 Dark/Light Mode**: Seamless theme switching with system preference detection.
- **💾 Persistent History**: Auto-saves conversations locally using IndexedDB.
- **⚡ Real-time Streaming**: Instant response streaming from local Ollama usage.
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
2.  **Node.js**: Version 16+ is required.

### Installation

1.  **Clone the repository** (if applicable) or navigate to the project folder.

2.  **Install Client Dependencies**:
    ```bash
    cd client
    npm install
    ```

3.  **Install Server Dependencies**:
    ```bash
    cd ..
    npm install
    ```

### Running the Application

1.  **Start the Backend Server** (Port 14000):
    ```bash
    # In the root directory
    npm start
    ```

2.  **Start the Frontend Client** (Port 5173):
    ```bash
    # In the client directory
    npm run dev
    ```

3.  **Open your browser**: Navigate to `http://localhost:5173`

## 🏗️ Architecture

-   **Frontend**: React (TypeScript), Vite, Tailwind CSS, IDB (IndexedDB wrapper).
-   **Backend**: Hono (Node.js), serving as a proxy to Ollama and handling stats.
-   **AI Engine**: Ollama (Local LLM), running on port 11434.
-   **Storage**: Browser's IndexedDB for chat history.

## 🛠️ Configuration

-   **Port**: Backend runs on `14000`. Frontend proxy is configured in `client/vite.config.ts`.
-   **Models**: The app automatically fetches available models from your local Ollama instance.
-   **PWA**: Icons/manifest configured in `client/vite.config.ts`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License.