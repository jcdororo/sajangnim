'use client'

import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cart-store'
import { useCreateOrder } from '@/hooks/use-orders'
import { cn } from '@/lib/utils'
import { ShoppingCart, Plus, Minus, Trash2, ChevronLeft, UtensilsCrossed } from 'lucide-react'

export function CartClient() {
  const router = useRouter()
  const { tableId, items, updateQuantity, removeItem, clearCart, totalPrice } = useCartStore()
  const { mutate: createOrder, isPending } = useCreateOrder()

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0)

  function handleOrder() {
    if (!tableId || items.length === 0) return

    createOrder(
      {
        tableId,
        items: items.map((i) => ({
          menu_item_id: i.id,
          menu_item_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      },
      {
        onSuccess: (order) => {
          clearCart()
          router.push(`/table/order?orderId=${order.id}`)
        },
      }
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <ShoppingCart className="w-16 h-16 text-gray-200" />
        <p className="text-gray-400 font-medium">장바구니가 비어있습니다</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-2xl"
        >
          메뉴 보러가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">장바구니</h1>
          <p className="text-xs text-gray-400">{totalCount}개 담김</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          전체삭제
        </button>
      </header>

      {/* 장바구니 아이템 목록 */}
      <div className="flex-1 p-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-center"
          >
            {/* 메뉴 아이콘 */}
            <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6 text-gray-200" />
            </div>

            {/* 정보 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-sm font-bold text-blue-600 mt-0.5">
                {(item.price * item.quantity).toLocaleString()}원
              </p>
              <p className="text-xs text-gray-400">{item.price.toLocaleString()}원 / 개</p>
            </div>

            {/* 수량 조절 + 삭제 */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => removeItem(item.id)}
                className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:scale-95 transition-all"
                >
                  <Minus className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <span className="text-sm font-bold text-gray-900 w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 주문 요약 + 버튼 */}
      <div className="bg-white border-t border-gray-100 p-5 pb-20 space-y-4">
        {/* 가격 요약 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>메뉴 ({totalCount}개)</span>
            <span>{totalPrice().toLocaleString()}원</span>
          </div>
          <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
            <span>총 결제금액</span>
            <span className="text-blue-600">{totalPrice().toLocaleString()}원</span>
          </div>
        </div>

        {/* 주문하기 버튼 */}
        <button
          onClick={handleOrder}
          disabled={isPending || !tableId}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-[0.98]',
            isPending || !tableId
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isPending ? '주문 중...' : `${totalPrice().toLocaleString()}원 주문하기`}
        </button>
      </div>
    </div>
  )
}
