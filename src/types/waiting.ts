export type WaitingStatus = 'waiting' | 'called' | 'seated' | 'cancelled'

export interface Waiting {
  id: string
  phone: string
  wait_number: number
  status: WaitingStatus
  created_at: string
}
