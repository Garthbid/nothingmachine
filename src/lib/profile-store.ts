import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserProfile {
  name: string
  bio: string
  email?: string
  mainGoal?: string
  keyInterests?: string[]
  selectedTemplateId?: string
  selectedTemplateName?: string
  onboardingCompleted?: boolean
}

interface ProfileState {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  updateProfile: (patch: Partial<UserProfile>) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (patch) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...patch } : null,
        })),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'nothing-machine-profile',
    }
  )
)
