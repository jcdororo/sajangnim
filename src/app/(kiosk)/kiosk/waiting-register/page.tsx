import { createClient } from '@/lib/supabase/server'
import { WaitingRegisterClient } from '@/components/kiosk/waiting-register-client'

export default async function WaitingRegisterPage() {
  const supabase = await createClient()

  const { count } = await supabase
    .from('waiting')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'waiting')

  return <WaitingRegisterClient waitingCount={count ?? 0} />
}
