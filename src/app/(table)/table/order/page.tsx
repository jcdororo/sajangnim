import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrderCompleteClient } from '@/components/table/order-complete-client'
import { Order } from '@/types/order'

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export default async function OrderPage({ searchParams }: Props) {
  const { orderId } = await searchParams
  if (!orderId) redirect('/table/menu')

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', orderId)
    .single()

  if (!order) redirect('/table/menu')

  return <OrderCompleteClient order={order as Order} />
}
