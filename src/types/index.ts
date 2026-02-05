export interface Message {
    id?: number
    role: 'user' | 'assistant'
    content: string
    isLoading?: boolean
    isError?: boolean
    stats?: {
        duration: string
        tokens: number
        speed: string
        model: string
    }
}

export interface Model {
    name: string
    size?: number
    modified?: string
}

export interface ChatHistory {
    [key: number]: string
}

export interface Status {
    online: boolean
    loading: boolean
    modelCount?: number
}
