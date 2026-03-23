'use client'

import { MenuItem } from '@/types/menu'
import { useCartStore } from '@/stores/cart-store'
import { cn } from '@/lib/utils'
import { Plus, Minus, UtensilsCrossed } from 'lucide-react'
import Image from 'next/image'

interface Props {
  item: MenuItem
}

export function MenuItemCard({ item }: Props) {
  const { items, addItem, updateQuantity } = useCartStore()
  const cartItem = items.find((i) => i.id === item.id)
  const quantity = cartItem?.quantity ?? 0

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
      {/* 이미지 */}
      <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-10 h-10 text-gray-200" />
        )}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-semibold bg-black/60 px-2 py-1 rounded-full">
              품절
            </span>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{item.name}</p>
          {item.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">
            {item.price.toLocaleString()}원
          </p>

          {/* 수량 조절 */}
          {quantity === 0 ? (
            <button
              onClick={() => addItem(item)}
              disabled={!item.is_available}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                item.is_available
                  ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-sm font-bold text-blue-600 w-4 text-center">
                {quantity}
              </span>
              <button
                onClick={() => addItem(item)}
                className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
