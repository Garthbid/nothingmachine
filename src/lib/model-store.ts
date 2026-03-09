'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ModelProvider = 'anthropic' | 'openai' | 'xai' | 'google'

export interface ModelConfig {
  id: string
  name: string
  provider: ModelProvider
  modelId: string
  apiKey: string
}

interface ModelStore {
  models: ModelConfig[]
  selectedModelId: string
  addModel: (model: ModelConfig) => void
  removeModel: (id: string) => void
  setSelectedModelId: (id: string) => void
}

const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: 'opus-4-6',
    name: 'Opus 4.6',
    provider: 'anthropic',
    modelId: 'claude-opus-4-6-20260301',
    apiKey: '',
  },
  {
    id: 'gpt-5-4',
    name: 'GPT 5.4',
    provider: 'openai',
    modelId: 'gpt-5.4',
    apiKey: '',
  },
]

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      models: DEFAULT_MODELS,
      selectedModelId: DEFAULT_MODELS[0].id,

      addModel: (model) =>
        set((state) => ({
          models: [...state.models, model],
        })),

      removeModel: (id) =>
        set((state) => ({
          models: state.models.filter((m) => m.id !== id),
          selectedModelId:
            state.selectedModelId === id
              ? state.models.find((m) => m.id !== id)?.id ?? ''
              : state.selectedModelId,
        })),

      setSelectedModelId: (id) => set({ selectedModelId: id }),
    }),
    {
      name: 'nothing-machine-model',
    }
  )
)
