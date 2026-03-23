'use client'

import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumPadProps {
  onPress: (key: string) => void
  disabled?: boolean
  canConfirm?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0', 'confirm']

export function NumPad({ onPress, disabled, canConfirm }: NumPadProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
      {KEYS.map((key) => {
        const isDelete = key === 'delete'
        const isConfirm = key === 'confirm'

        return (
          <button
            key={key}
            onClick={() => onPress(key)}
            disabled={disabled || (isConfirm && !canConfirm)}
            className={cn(
              'h-16 rounded-2xl text-2xl font-semibold transition-all active:scale-95',
              'flex items-center justify-center select-none',
              isConfirm
                ? 'bg-blue-600 text-white disabled:bg-gray-200 disabled:text-gray-400'
                : isDelete
                ? 'bg-gray-200 text-gray-700 active:bg-gray-300'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 active:bg-gray-50'
            )}
          >
            {isDelete ? (
              <Delete className="w-6 h-6" />
            ) : isConfirm ? (
              <span className="text-lg">확인</span>
            ) : (
              key
            )}
          </button>
        )
      })}
    </div>
  )
}
