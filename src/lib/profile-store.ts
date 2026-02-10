import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProfile {
  name: string
  bio: string
}

interface ProfileState {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'nothing-machine-profile',
    }
  )
)
