export interface MenuCategory {
  id: string
  name: string
  sort_order: number
}

export interface MenuItem {
  id: string
  category_id: string
  name: string
  price: number
  description: string | null
  image_url: string | null
  is_available: boolean
  sort_order: number
}
