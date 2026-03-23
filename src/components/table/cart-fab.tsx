'use client'

import { useCartStore } from '@/stores/cart-store'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'

export function CartFab() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice)

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)

  if (totalCount === 0) return null

  return (
    <button
      onClick={() => router.push('/table/cart')}
      className="fixed bottom-20 left-4 right-4 z-20 bg-blue-600 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {totalCount}
          </span>
        </div>
        <span className="font-semibold text-sm">{totalCount}개 담김</span>
      </div>
      <span className="font-bold text-sm">{totalPrice().toLocaleString()}원 보기</span>
    </button>
  )
}
