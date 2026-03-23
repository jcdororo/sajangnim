import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Waiting } from '@/types/waiting'

const supabase = createClient()

export function useWaitingList() {
  return useQuery({
    queryKey: ['waiting'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('waiting')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .order('wait_number', { ascending: true })
      if (error) throw error
      return data as Waiting[]
    },
  })
}

export function useCurrentCalledNumber() {
  return useQuery({
    queryKey: ['waiting-called'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('waiting')
        .select('wait_number')
        .in('status', ['called', 'seated'])
        .gte('created_at', `${today}T00:00:00`)
        .order('wait_number', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data?.wait_number ?? 0
    },
  })
}

export function useUpdateWaitingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Waiting['status'] }) => {
      const { error } = await supabase
        .from('waiting')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting'] })
      queryClient.invalidateQueries({ queryKey: ['waiting-called'] })
    },
  })
}

export function useRegisterWaiting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (phone: string) => {
      const { data, error } = await supabase
        .from('waiting')
        .insert({ phone, status: 'waiting' })
        .select()
        .single()
      if (error) throw error
      return data as Waiting
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiting'] })
    },
  })
}
