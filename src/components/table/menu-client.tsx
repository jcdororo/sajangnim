'use client'

import { useEffect, useState } from 'react'
import { useMenuCategories, useMenuItems } from '@/hooks/use-menu'
import { useCartStore } from '@/stores/cart-store'
import { MenuItemCard } from './menu-item-card'
import { CartFab } from './cart-fab'
import { cn } from '@/lib/utils'
import { UtensilsCrossed } from 'lucide-react'

interface Props {
  tableId: string
  tableName: string
}

export function MenuClient({ tableId, tableName }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)
  const setTableId = useCartStore((s) => s.setTableId)

  useEffect(() => {
    setTableId(tableId)
  }, [tableId, setTableId])

  const { data: categories = [] } = useMenuCategories()
  const { data: items = [], isLoading } = useMenuItems(selectedCategory)

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-5 pt-5 pb-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">메뉴</h1>
            <p className="text-xs text-gray-400">{tableName}</p>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none -mx-1 px-1">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={cn(
              'shrink-0 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-colors',
              selectedCategory === undefined
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'shrink-0 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-colors',
                selectedCategory === cat.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* 메뉴 그리드 */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <UtensilsCrossed className="w-12 h-12 text-gray-200" />
            <p className="text-sm text-gray-300">메뉴가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* 장바구니 플로팅 버튼 */}
      <CartFab />
    </div>
  )
}
