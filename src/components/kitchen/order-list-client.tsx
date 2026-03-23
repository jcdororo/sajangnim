'use client'

import { useState, useEffect } from 'react'
import { useKitchenOrders, KitchenOrder } from '@/hooks/use-orders'
import { useUpdateOrderStatus } from '@/hooks/use-orders'
import { useRealtimeOrders } from '@/hooks/use-realtime-orders'
import { OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils'
import { ChefHat, Bell, Flame, CheckCheck, Wifi } from 'lucide-react'

type FilterTab = 'active' | OrderStatus

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'active', label: '진행중' },
  { value: 'pending', label: '새 주문' },
  { value: 'cooking', label: '조리중' },
  { value: 'ready', label: '서빙 대기' },
  { value: 'served', label: '완료' },
]

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; cardClass: string; badgeClass: string; icon: React.ReactNode }
> = {
  pending: {
    label: '새 주문',
    cardClass: 'border-orange-500 bg-orange-950/30',
    badgeClass: 'bg-orange-500 text-white',
    icon: <Bell className="w-4 h-4" />,
  },
  cooking: {
    label: '조리중',
    cardClass: 'border-blue-500 bg-blue-950/30',
    badgeClass: 'bg-blue-500 text-white',
    icon: <Flame className="w-4 h-4" />,
  },
  ready: {
    label: '서빙 대기',
    cardClass: 'border-green-500 bg-green-950/30',
    badgeClass: 'bg-green-500 text-white',
    icon: <CheckCheck className="w-4 h-4" />,
  },
  served: {
    label: '완료',
    cardClass: 'border-gray-700 bg-gray-800/40',
    badgeClass: 'bg-gray-600 text-gray-300',
    icon: <CheckCheck className="w-4 h-4" />,
  },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'cooking',
  cooking: 'ready',
  ready: 'served',
}

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: '조리 시작',
  cooking: '조리 완료',
  ready: '서빙 완료',
}

const NEXT_BTN_CLASS: Partial<Record<OrderStatus, string>> = {
  pending: 'bg-orange-500 hover:bg-orange-600 text-white',
  cooking: 'bg-blue-500 hover:bg-blue-600 text-white',
  ready: 'bg-green-500 hover:bg-green-600 text-white',
}

function useElapsedTime(createdAt: string) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
      if (diff < 60) setElapsed(`${diff}초`)
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}분`)
      else setElapsed(`${Math.floor(diff / 3600)}시간`)
    }
    update()
    const id = setInterval(update, 10000)
    return () => clearInterval(id)
  }, [createdAt])

  return elapsed
}

function OrderCard({
  order,
  onAction,
  isPending,
}: {
  order: KitchenOrder
  onAction: (id: string, status: OrderStatus) => void
  isPending: boolean
}) {
  const elapsed = useElapsedTime(order.created_at)
  const config = STATUS_CONFIG[order.status]
  const nextStatus = NEXT_STATUS[order.status]
  const nextLabel = NEXT_LABEL[order.status]
  const nextBtnClass = NEXT_BTN_CLASS[order.status]
  const isUrgent = order.status === 'pending'

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-4 space-y-3 transition-all',
        config.cardClass,
        isUrgent && 'animate-pulse-subtle'
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
              config.badgeClass
            )}
          >
            {config.icon}
            {config.label}
          </span>
          <span className="text-white font-bold text-base">{order.table_name}</span>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-xs">{elapsed} 전</p>
          <p className="text-gray-500 text-xs">
            {new Date(order.created_at).toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* 주문 아이템 */}
      <ul className="space-y-1.5 border-t border-white/10 pt-3">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold flex items-center justify-center">
                {item.quantity}
              </span>
              <span className="text-white text-sm font-medium">{item.menu_item_name}</span>
            </div>
            <span className="text-gray-400 text-xs">
              {(item.price * item.quantity).toLocaleString()}원
            </span>
          </li>
        ))}
      </ul>

      {/* 합계 + 액션 버튼 */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10">
        <span className="text-gray-400 text-sm">
          총{' '}
          <span className="text-white font-semibold">
            {order.total_price.toLocaleString()}원
          </span>
        </span>
        {nextStatus && nextLabel && (
          <button
            onClick={() => onAction(order.id, nextStatus)}
            disabled={isPending}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50',
              nextBtnClass
            )}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}

export function OrderListClient() {
  useRealtimeOrders()

  const [tab, setTab] = useState<FilterTab>('active')
  const { data: allOrders = [], isLoading } = useKitchenOrders()
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()

  function handleAction(id: string, status: OrderStatus) {
    updateStatus({ id, status })
  }

  const filtered = (() => {
    if (tab === 'active') return allOrders.filter((o) => o.status !== 'served')
    return allOrders.filter((o) => o.status === tab)
  })()

  const counts = {
    pending: allOrders.filter((o) => o.status === 'pending').length,
    cooking: allOrders.filter((o) => o.status === 'cooking').length,
    ready: allOrders.filter((o) => o.status === 'ready').length,
    served: allOrders.filter((o) => o.status === 'served').length,
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 */}
      <header className="bg-gray-800 border-b border-gray-700 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-orange-400" />
          <h1 className="text-lg font-bold text-white">주방</h1>
        </div>
        <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <Wifi className="w-3.5 h-3.5" />
          실시간
        </div>
      </header>

      {/* 상태 요약 */}
      <div className="bg-gray-800 border-b border-gray-700 px-5 py-3 grid grid-cols-4 gap-2">
        {(
          [
            { key: 'pending', label: '새 주문', color: 'text-orange-400' },
            { key: 'cooking', label: '조리중', color: 'text-blue-400' },
            { key: 'ready', label: '서빙 대기', color: 'text-green-400' },
            { key: 'served', label: '완료', color: 'text-gray-400' },
          ] as const
        ).map(({ key, label, color }) => (
          <div key={key} className="text-center">
            <p className={cn('text-xl font-black', color)}>{counts[key]}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* 필터 탭 */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 flex gap-1 overflow-x-auto scrollbar-none">
        {TABS.map(({ value, label }) => {
          const count = value === 'active'
            ? counts.pending + counts.cooking + counts.ready
            : counts[value]

          return (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={cn(
                'shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                tab === value
                  ? 'border-orange-400 text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              )}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 주문 목록 */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ChefHat className="w-12 h-12 text-gray-700" />
            <p className="text-gray-600 text-sm">주문이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAction={handleAction}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
