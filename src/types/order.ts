export type OrderStatus = 'pending' | 'cooking' | 'ready' | 'served'

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  menu_item_name: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  table_id: string
  status: OrderStatus
  total_price: number
  items: OrderItem[]
  created_at: string
}
