import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Order, OrderStatus } from '@/types/order'

const supabase = createClient()

export type KitchenOrder = Order & { table_name: string }

export function useKitchenOrders(statusFilter?: OrderStatus[]) {
  return useQuery({
    queryKey: ['kitchen-orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*), tables(name)')
        .order('created_at', { ascending: true })

      if (statusFilter && statusFilter.length > 0) {
        query = query.in('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error

      return (data ?? []).map((o) => ({
        ...o,
        table_name: (o.tables as { name: string } | null)?.name ?? '알 수 없음',
      })) as KitchenOrder[]
    },
  })
}

export function useOrders(tableId?: string) {
  return useQuery({
    queryKey: ['orders', tableId],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false })

      if (tableId) {
        query = query.eq('table_id', tableId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Order[]
    },
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tableId,
      items,
    }: {
      tableId: string
      items: { menu_item_id: string; menu_item_name: string; price: number; quantity: number }[]
    }) => {
      const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ table_id: tableId, status: 'pending', total_price: totalPrice })
        .select()
        .single()
      if (orderError) throw orderError

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(items.map((i) => ({ ...i, order_id: order.id })))
      if (itemsError) throw itemsError

      return order as Order
    },
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders', order.table_id] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: Pick<Order, 'id' | 'status'>) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
