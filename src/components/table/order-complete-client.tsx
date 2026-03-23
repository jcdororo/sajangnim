'use client'

import { useRouter } from 'next/navigation'
import { Order } from '@/types/order'
import { CheckCircle } from 'lucide-react'

interface Props {
  order: Order
}

export function OrderCompleteClient({ order }: Props) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-12 text-center">
      {/* 완료 아이콘 */}
      <div className="flex flex-col items-center gap-3">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">주문 완료!</h1>
        <p className="text-sm text-gray-400">주문이 정상적으로 접수되었습니다</p>
      </div>

      {/* 주문 내역 */}
      <div className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-700">주문 내역</p>
        </div>
        <ul className="divide-y divide-gray-50">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between items-center px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.menu_item_name}</p>
                <p className="text-xs text-gray-400">{item.price.toLocaleString()}원 × {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {(item.price * item.quantity).toLocaleString()}원
              </p>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between">
          <span className="text-sm font-bold text-gray-900">합계</span>
          <span className="text-sm font-bold text-blue-600">
            {order.total_price.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 안내 + 버튼 */}
      <div className="w-full space-y-3">
        <p className="text-xs text-gray-400">
          요리가 완료되면 서버가 음식을 가져다 드립니다
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/table/order-history')}
            className="flex-1 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            주문내역 보기
          </button>
          <button
            onClick={() => router.back()}
            className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            메뉴 더 보기
          </button>
        </div>
      </div>
    </div>
  )
}
