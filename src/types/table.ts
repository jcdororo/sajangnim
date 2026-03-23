export type TableStatus = 'empty' | 'occupied'

export interface Table {
  id: string
  name: string
  status: TableStatus
  capacity: number
}
