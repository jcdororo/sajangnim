import { createClient } from '@/lib/supabase/server'
import { MenuClient } from '@/components/table/menu-client'
import { redirect } from 'next/navigation'

interface Props {
  searchParams: Promise<{ tableId?: string }>
}

export default async function MenuPage({ searchParams }: Props) {
  const { tableId } = await searchParams

  if (!tableId) redirect('/table/menu?tableId=demo')

  const supabase = await createClient()
  const { data: table } = await supabase
    .from('tables')
    .select('name')
    .eq('id', tableId)
    .maybeSingle()

  const tableName = table?.name ?? `테이블 ${tableId}`

  return <MenuClient tableId={tableId} tableName={tableName} />
}
