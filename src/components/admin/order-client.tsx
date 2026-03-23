'use client'

import { useState } from 'react'
import { useKitchenOrders, KitchenOrder } from '@/hooks/use-orders'
import { useUpdateOrderStatus } from '@/hooks/use-orders'
import { useRealtimeOrders } from '@/hooks/use-realtime-orders'
import { OrderStatus } from '@/types/order'
import { cn } from '@/lib/utils'
import { ShoppingBag, ChevronDown, ChevronUp, Wifi } from 'lucide-react'

type FilterTab = 'all' | OrderStatus

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '접수 대기' },
  { value: 'cooking', label: '조리중' },
  { value: 'ready', label: '서빙 대기' },
  { value: 'served', label: '완료' },
]

const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  pending:  { label: '접수 대기', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  cooking:  { label: '조리중',    className: 'bg-blue-50 text-blue-600 border-blue-200' },
  ready:    { label: '서빙 대기', className: 'bg-green-50 text-green-600 border-green-200' },
  served:   { label: '완료',      className: 'bg-gray-100 text-gray-400 border-gray-200' },
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

function OrderRow({
  order,
  onAction,
  isPending,
}: {
  order: KitchenOrder
  onAction: (id: string, status: OrderStatus) => void
  isPending: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const badge = STATUS_BADGE[order.status]
  const nextStatus = NEXT_STATUS[order.status]
  const nextLabel = NEXT_LABEL[order.status]

  return (
    <li className="bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{order.table_name}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', badge.className)}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} ·{' '}
              <span className="font-medium text-gray-600">{order.total_price.toLocaleString()}원</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {nextStatus && nextLabel && (
            <button
              onClick={() => onAction(order.id, nextStatus)}
              disabled={isPending}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {nextLabel}
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <ul className="mt-3 border-t border-gray-50 pt-3 space-y-1.5">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                <span className="text-gray-400 mr-1.5">×{item.quantity}</span>
                {item.menu_item_name}
              </span>
              <span className="text-gray-400 text-xs">
                {(item.price * item.quantity).toLocaleString()}원
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function OrderManagementClient() {
  useRealtimeOrders()

  const [tab, setTab] = useState<FilterTab>('all')
  const { data: orders = [], isLoading } = useKitchenOrders()
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus()

  function handleAction(id: string, status: OrderStatus) {
    updateStatus({ id, status })
  }

  const filtered = tab === 'all' ? orders : orders.filter((o) => o.status === tab)

  const counts: Record<OrderStatus, number> = {
    pending: orders.filter((o) => o.status === 'pending').length,
    cooking: orders.filter((o) => o.status === 'cooking').length,
    ready:   orders.filter((o) => o.status === 'ready').length,
    served:  orders.filter((o) => o.status === 'served').length,
  }

  const totalRevenue = orders
    .filter((o) => o.status === 'served')
    .reduce((sum, o) => sum + o.total_price, 0)

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">주문 관리</h1>
        <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <Wifi className="w-3.5 h-3.5" />
          실시간
        </div>
      </div>

      {/* 통계 */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 grid grid-cols-4 gap-2">
        {(
          [
            { key: 'pending', label: '접수 대기', color: 'text-orange-500' },
            { key: 'cooking', label: '조리중',    color: 'text-blue-500' },
            { key: 'ready',   label: '서빙 대기', color: 'text-green-500' },
            { key: 'served',  label: '완료',      color: 'text-gray-400' },
          ] as const
        ).map(({ key, label, color }) => (
          <div key={key} className="bg-gray-50 rounded-xl p-2 text-center">
            <p className={cn('text-xl font-bold', color)}>{counts[key]}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* 매출 */}
      <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-gray-500">오늘 완료 매출</span>
        <span className="text-base font-bold text-gray-900">{totalRevenue.toLocaleString()}원</span>
      </div>

      {/* 필터 탭 */}
      <div className="bg-white border-b border-gray-100 px-4 flex gap-1 overflow-x-auto scrollbar-none">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={cn(
              'shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              tab === value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            {label}
            {value !== 'all' && counts[value] > 0 && (
              <span className="ml-1.5 text-xs">({counts[value]})</span>
            )}
          </button>
        ))}
      </div>

      {/* 주문 목록 */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-300">
            불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <ShoppingBag className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-300">주문이 없습니다</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onAction={handleAction}
                isPending={isPending}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
