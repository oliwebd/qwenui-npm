import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Message } from '../types'

interface QwenDB extends DBSchema {
    chats: {
        key: number
        value: {
            id: number
            title: string
            messages: Message[]
            updatedAt: number
            model: string
        }
        indexes: { 'by-updated': number }
    }
}

let dbPromise: Promise<IDBPDatabase<QwenDB>>

export const initDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<QwenDB>('qwen-studio-db', 1, {
            upgrade(db) {
                const store = db.createObjectStore('chats', { keyPath: 'id' })
                store.createIndex('by-updated', 'updatedAt')
            },
        })
    }
    return dbPromise
}

export const saveChat = async (id: number, messages: Message[], model: string) => {
    if (messages.length === 0) return

    const db = await initDB()
    const existing = await db.get('chats', id)

    // Generate title from first message if it's a new chat, otherwise keep existing or update if generic
    let title = existing?.title
    if (!title || title === 'New Chat') {
        const firstUserMsg = messages.find(m => m.role === 'user')
        if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
        } else {
            title = 'New Chat'
        }
    }

    await db.put('chats', {
        id,
        title,
        messages,
        updatedAt: Date.now(),
        model
    })
}

export const getChats = async () => {
    const db = await initDB()
    return await db.getAllFromIndex('chats', 'by-updated')
}

export const getChat = async (id: number) => {
    const db = await initDB()
    return await db.get('chats', id)
}

export const deleteChat = async (id: number) => {
    const db = await initDB()
    await db.delete('chats', id)
}
