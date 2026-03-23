import { create } from 'zustand'
import { Waiting } from '@/types/waiting'

interface WaitingStore {
  phone: string
  currentWaiting: Waiting | null
  setPhone: (phone: string) => void
  setCurrentWaiting: (waiting: Waiting | null) => void
  reset: () => void
}

export const useWaitingStore = create<WaitingStore>((set) => ({
  phone: '',
  currentWaiting: null,
  setPhone: (phone) => set({ phone }),
  setCurrentWaiting: (waiting) => set({ currentWaiting: waiting }),
  reset: () => set({ phone: '', currentWaiting: null }),
}))
