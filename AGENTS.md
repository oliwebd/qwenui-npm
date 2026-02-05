# AI Agent Documentation 🤖

This document is designed to help AI agents understand the Qwen Studio codebase, its architecture, and development patterns.

## 📂 Project Structure (Flattened)

```
/
├── src/
│   ├── components/    # UI Components
│   │   ├── App.tsx          # Main layout orchestrator
│   │   ├── ChatWindow.tsx   # Message list & welcome screen
│   │   ├── InputArea.tsx    # User input & model selector
│   │   ├── Message.tsx      # Individual message render & stats
│   │   ├── Sidebar.tsx      # History, models, & settings
│   │   └── MobileHeader.tsx # Mobile navigation
│   ├── hooks/         # Custom React Hooks
│   │   ├── useChat.ts       # Chat logic, streaming, & IDB sync
│   │   ├── useModels.ts     # Model fetching & status
│   │   └── useTheme.ts      # Theme management
│   ├── utils/         # Utilities
│   │   ├── db.ts            # IndexedDB wrapper (idb)
│   │   └── markdown.ts      # Markdown parsing
│   ├── types/         # TypeScript definitions
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── index.html         # HTML entry point
├── package.json       # Project configuration (Vite scripts)
├── vite.config.ts     # Vite config (Proxy to Ollama, PWA)
├── tsconfig.json      # TypeScript configuration
└── AGENTS.md          # This document
```

## 🏗️ State Management

-   **Chat State**: Managed in `useChat.ts`.
    -   `messages`: Array of `Message` objects.
    -   `isGenerating`: Flag for active streams.
    -   `chatHistory`: Local history map.
    -   **Persistence**: Handled by `utils/db.ts` (IndexedDB).
-   **Theme State**: Managed in `useTheme.ts`, persisted in `localStorage`.
-   **Model State**: Managed in `useModels.ts`, fetches directly from Ollama `/api/tags` via proxy.

## 🔄 Data Flow

1.  **User Input**: `InputArea` captures text -> calls `sendMessage` in `useChat`.
2.  **Ollama Request**: `sendMessage` POSTs to `/api/chat`.
    -   Vite proxy forwards `/api/*` to `http://localhost:11434/api/*`.
3.  **Streaming**: Response is read as an NDJSON stream.
4.  **Parsing**: Each line is parsed as JSON; content is appended to message state.
5.  **Metrics**: Final JSON chunk (`done: true`) contains generation stats.

## 🎨 Styling

-   **Tailwind CSS v4**: Core styling framework.
-   **index.css**: Contains global resets and standard CSS for animations/scrollbars to avoid IDE warnings.
-   **Themes**: Toggleable light/dark modes.

## 🧠 Development Tips

-   **Direct Ollama usage**: No separate backend server is needed.
-   **Flattened structure**: All source code is in `src/`.
-   **Vite Proxy**: Ensure Ollama is running on port 11434 if using the default proxy settings.
