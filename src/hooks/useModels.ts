import { useState, useEffect, useCallback } from 'react'
import type { Model, Status } from '../types'

const API_BASE = '/api'

export function useModels() {
    const [models, setModels] = useState<Model[]>([])
    const [currentModel, setCurrentModel] = useState('qwen2.5-coder:1.5b')
    const [status, setStatus] = useState<Status>({ online: false, loading: true })

    const fetchModels = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/tags`)
            if (res.ok) {
                const data = await res.json()
                const modelList: Model[] = data.models || []
                setModels(modelList)
                if (modelList.length > 0) {
                    const hasCurrentModel = modelList.some(m => m.name === currentModel)
                    if (!hasCurrentModel) {
                        setCurrentModel(modelList[0].name)
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching models:', error)
            setModels([
                { name: 'qwen2.5-coder:1.5b' },
                { name: 'qwen2.5-coder:7b' },
                { name: 'llama3.2:latest' }
            ])
        }
    }, [currentModel])

    const checkStatus = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/tags`, {
                signal: AbortSignal.timeout(3000)
            })
            if (res.ok) {
                const data = await res.json()
                setStatus({
                    online: true,
                    modelCount: data.models?.length || 0,
                    loading: false
                })
            } else {
                setStatus({ online: false, loading: false })
            }
        } catch {
            setStatus({ online: false, loading: false })
        }
    }, [])

    const refreshModels = useCallback(async () => {
        await fetchModels()
        await checkStatus()
    }, [fetchModels, checkStatus])

    useEffect(() => {
        fetchModels()
        checkStatus()
        const interval = setInterval(checkStatus, 60000)
        return () => clearInterval(interval)
    }, [fetchModels, checkStatus])

    return { models, currentModel, setCurrentModel, refreshModels, status }
}
