import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, MenuCategory } from '@/types/menu'

const supabase = createClient()

export function useMenuCategories() {
  return useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order')
      if (error) throw error
      return data as MenuCategory[]
    },
  })
}

export function useMenuItems(categoryId?: string) {
  return useQuery({
    queryKey: ['menu-items', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('sort_order')

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as MenuItem[]
    },
  })
}
