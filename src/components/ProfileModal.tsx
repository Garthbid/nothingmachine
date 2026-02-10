'use client'

import { useState, useEffect } from 'react'
import { useProfileStore } from '@/lib/profile-store'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, setProfile } = useProfileStore()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (open) {
      setName(profile?.name || '')
      setBio(profile?.bio || '')
    }
  }, [open, profile])

  if (!open) return null

  const handleSave = () => {
    if (!name.trim()) return
    setProfile({ name: name.trim(), bio: bio.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60">
      <div className="bg-[#111] border border-white/10 rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Your Profile</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio so the Nothing Machine knows who you are..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white/60">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!name.trim()} className="bg-white text-black hover:bg-white/90">
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
