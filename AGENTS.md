# AI Agent Documentation 🤖

This document is designed to help AI agents understand the Qwen Studio codebase, its architecture, and development patterns.

## 📂 Project Structure

```
/
├── server.js              # Backend entry point (Hono server)
├── package.json           # Root package configuration
├── client/                # Frontend application (React + Vite)
│   ├── src/
│   │   ├── components/    # UI Components
│   │   │   ├── App.tsx          # Main layout orchestrator
│   │   │   ├── ChatWindow.tsx   # Message list & welcome screen
│   │   │   ├── InputArea.tsx    # User input & model selector
│   │   │   ├── Message.tsx      # Individual message render & stats
│   │   │   ├── Sidebar.tsx      # History, models, & settings
│   │   │   └── MobileHeader.tsx # Mobile navigation
│   │   ├── hooks/         # Custom React Hooks
│   │   │   ├── useChat.ts       # Chat logic, streaming, & IDB sync
│   │   │   ├── useModels.ts     # Model fetching & status
│   │   │   └── useTheme.ts      # Theme management
│   │   ├── utils/         # Utilities
│   │   │   ├── db.ts            # IndexedDB wrapper (idb)
│   │   │   └── markdown.ts      # Markdown parsing
│   │   ├── types/         # TypeScript definitions
│   │   └── main.tsx       # Entry point
│   ├── index.html         # HTML entry with font preconnects
│   └── vite.config.ts     # Vite config (Proxy, PWA)
└── ...
```

## 🏗️ State Management

-   **Chat State**: Managed in `useChat.ts`.
    -   `messages`: Array of `Message` objects (content, role, stats).
    -   `isGenerating`: Boolean flag for active streams.
    -   `chatHistory`: Object mapping IDs to titles.
    -   **Persistence**: Handled by `utils/db.ts` (IndexedDB) via side-effects in `useChat`.
-   **Theme State**: Managed in `useTheme.ts`, persisted in `localStorage`.
-   **Model State**: Managed in `useModels.ts`, fetches from backend `/api/models`.

## 🔄 Data Flow

1.  **User Input**: `InputArea` captures text -> calls `sendMessage` in `useChat`.
2.  **API Call**: `sendMessage` POSTs to `/api/chat` (proxied to backend).
3.  **Streaming**: Backend streams response chunks.
    -   **Content**: Text chunks appended to `fullText`.
    -   **Stats**: Final chunk contains `__STATS__{json}` delimiter.
4.  **Rendering**: `useChat` updates `messages` state -> `ChatWindow` -> `Message` renders markdown & stats.
5.  **Storage**: `useChat` triggers `saveChat` in `db.ts` on message updates.

## 🛠️ Key Components & logic

### `useChat.ts`
The core logic engine. It handles:
-   `sendMessage`: Initiates fetch stream.
-   Stream Reading: Decodes chunks, handles `__STATS__` parsing.
-   `AbortController`: Handles stop generation.
-   `optimistic updates`: Immediately shows user message and empty AI loader.

### `server.js`
A lightweight Hono server acting as a proxy/middleware.
-   **Streaming Response**: Uses `stream` helper from Hono.
-   **Stats Calculation**: Calculates duration and tokens from Ollama's final response part.
-   **Protocol**: Appends metadata via `__STATS__` delimiter.

## 🎨 Styling

-   **Tailwind CSS v4**: Imported in `index.css`.
-   **Theme Variables**: Uses CSS variables for some base colors but mostly Tailwind utility classes with `dark:` modifiers.
-   **Typography**: Inter font via Google Fonts (loaded in `index.html`).
-   **Icons**: `lucide-react`.

## 🧠 Context for Modifications

-   **Adding Features**: Always verify if a new feature needs persistence (add to `db.ts`) or API support (update `server.js`).
-   **UI Changes**: Respect the glassmorphism/gradient aesthetic. Use `slate` colors for neutrals and `indigo/purple` for accents.
-   **Type Safety**: Always update `types/index.ts` when changing data structures.
