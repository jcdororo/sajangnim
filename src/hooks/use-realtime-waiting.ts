'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeWaiting() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('waiting-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'waiting' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['waiting'] })
          queryClient.invalidateQueries({ queryKey: ['waiting-called'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
