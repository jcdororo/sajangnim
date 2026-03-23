import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Table, TableStatus } from '@/types/table'

const supabase = createClient()

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('name')
      if (error) throw error
      return data as Table[]
    },
  })
}

export function useCreateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, capacity }: { name: string; capacity: number }) => {
      const { data, error } = await supabase
        .from('tables')
        .insert({ name, capacity, status: 'empty' })
        .select()
        .single()
      if (error) throw error
      return data as Table
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useUpdateTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Table> & { id: string }) => {
      const { error } = await supabase
        .from('tables')
        .update(updates)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
  })
}

export function useDeleteTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] }),
  })
}
