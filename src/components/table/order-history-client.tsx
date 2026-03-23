'use client'

import { useCartStore } from '@/stores/cart-store'
import { useOrders } from '@/hooks/use-orders'
import { useRealtimeOrders } from '@/hooks/use-realtime-orders'
import { Order, OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  Clock,
  Flame,
  CheckCheck,
  ConciergeBell,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; barClass: string; icon: React.ReactNode; step: number }
> = {
  pending:  { label: '주문 접수',  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',  barClass: 'bg-amber-400',  icon: <Clock className="w-3.5 h-3.5" />,        step: 1 },
  cooking:  { label: '조리중',    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',      barClass: 'bg-blue-500',   icon: <Flame className="w-3.5 h-3.5" />,         step: 2 },
  ready:    { label: '준비완료',  badgeClass: 'bg-green-50 text-green-700 border-green-200',   barClass: 'bg-green-500',  icon: <ConciergeBell className="w-3.5 h-3.5" />, step: 3 },
  served:   { label: '서빙완료',  badgeClass: 'bg-gray-100 text-gray-500 border-gray-200',     barClass: 'bg-gray-300',   icon: <CheckCheck className="w-3.5 h-3.5" />,    step: 4 },
}

const PROGRESS_STEPS = ['주문 접수', '조리중', '준비완료', '서빙완료']

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(order.status !== 'served')
  const config = STATUS_CONFIG[order.status]
  const isReady = order.status === 'ready'

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border overflow-hidden transition-all',
        isReady ? 'border-green-300 shadow-green-100 shadow-md' : 'border-gray-100'
      )}
    >
      {/* 준비완료 배너 */}
      {isReady && (
        <div className="bg-green-500 text-white text-sm font-bold text-center py-2 flex items-center justify-center gap-1.5 animate-pulse">
          <ConciergeBell className="w-4 h-4" />
          음식이 준비되었습니다! 잠시만 기다려주세요
        </div>
      )}

      {/* 카드 헤더 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-5 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border',
              config.badgeClass
            )}
          >
            {config.icon}
            {config.label}
          </span>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            {order.total_price.toLocaleString()}원
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* 진행 상태 바 */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-1">
          {PROGRESS_STEPS.map((step, idx) => {
            const active = idx < config.step
            return (
              <div key={step} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'h-1.5 w-full rounded-full transition-colors',
                    active ? config.barClass : 'bg-gray-100'
                  )}
                />
                {config.step === idx + 1 && (
                  <span className="text-xs text-gray-500 whitespace-nowrap">{step}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 주문 아이템 (접기/펼치기) */}
      {expanded && (
        <div className="border-t border-gray-50 px-5 py-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center">
                  {item.quantity}
                </span>
                <span className="text-sm text-gray-700">{item.menu_item_name}</span>
              </div>
              <span className="text-sm text-gray-500">
                {(item.price * item.quantity).toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function OrderHistoryClient() {
  const router = useRouter()
  const tableId = useCartStore((s) => s.tableId)
  const { data: orders = [], isLoading } = useOrders(tableId ?? undefined)
  useRealtimeOrders(tableId ?? undefined)

  const totalSpent = orders.reduce((sum, o) => sum + o.total_price, 0)
  const activeOrders = orders.filter((o) => o.status !== 'served')

  if (!tableId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6">
        <ClipboardList className="w-14 h-14 text-gray-200" />
        <p className="text-gray-400 text-sm">테이블 정보가 없습니다</p>
        <button
          onClick={() => router.push('/table/menu')}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-2xl"
        >
          메뉴로 이동
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">주문내역</h1>
        {orders.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            총 {orders.length}건 · {totalSpent.toLocaleString()}원
          </p>
        )}
      </header>

      {/* 진행중인 주문 알림 */}
      {activeOrders.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-100 px-5 py-3 flex items-center gap-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </div>
          <p className="text-xs font-medium text-blue-700">
            진행중인 주문 {activeOrders.length}건이 있습니다
          </p>
        </div>
      )}

      {/* 주문 목록 */}
      <div className="flex-1 p-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <ClipboardList className="w-14 h-14 text-gray-200" />
            <p className="text-gray-400 text-sm">아직 주문내역이 없습니다</p>
            <button
              onClick={() => router.push('/table/menu')}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-2xl"
            >
              메뉴 주문하기
            </button>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </div>
    </div>
  )
}
