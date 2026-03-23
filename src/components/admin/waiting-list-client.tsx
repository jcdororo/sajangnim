'use client'

import { useState } from 'react'
import { useWaitingList, useUpdateWaitingStatus } from '@/hooks/use-waiting'
import { useRealtimeWaiting } from '@/hooks/use-realtime-waiting'
import { Waiting } from '@/types/waiting'
import { cn } from '@/lib/utils'
import { Phone, Clock, BellRing, CheckCircle2, XCircle, Users } from 'lucide-react'

type FilterTab = 'all' | Waiting['status']

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'waiting', label: '대기중' },
  { value: 'called', label: '호출됨' },
  { value: 'seated', label: '입장완료' },
  { value: 'cancelled', label: '취소' },
]

const NEXT_STATUS: Partial<Record<Waiting['status'], Waiting['status']>> = {
  waiting: 'called',
  called: 'seated',
}

const ACTION_LABEL: Partial<Record<Waiting['status'], string>> = {
  waiting: '호출',
  called: '입장',
}

const ACTION_COLOR: Partial<Record<Waiting['status'], string>> = {
  waiting: 'bg-blue-600 text-white hover:bg-blue-700',
  called: 'bg-green-600 text-white hover:bg-green-700',
}

const STATUS_BADGE: Record<
  Waiting['status'],
  { label: string; className: string }
> = {
  waiting: { label: '대기중', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  called:  { label: '호출됨', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  seated:  { label: '입장완료', className: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: '취소', className: 'bg-gray-100 text-gray-400 border-gray-200' },
}

function maskPhone(phone: string) {
  return phone.replace(/(\d{3})-?(\d{4})-?(\d{4})/, '$1-****-$3')
}

export function WaitingListClient() {
  useRealtimeWaiting()

  const [tab, setTab] = useState<FilterTab>('all')
  const { data: list = [], isLoading } = useWaitingList()
  const { mutate: updateStatus, isPending } = useUpdateWaitingStatus()

  const stats = {
    waiting: list.filter((w) => w.status === 'waiting').length,
    called:  list.filter((w) => w.status === 'called').length,
    seated:  list.filter((w) => w.status === 'seated').length,
  }

  const filtered = tab === 'all' ? list : list.filter((w) => w.status === tab)

  function handleAction(w: Waiting) {
    const next = NEXT_STATUS[w.status]
    if (!next) return
    updateStatus({ id: w.id, status: next })
  }

  function handleCancel(w: Waiting) {
    if (w.status === 'seated' || w.status === 'cancelled') return
    updateStatus({ id: w.id, status: 'cancelled' })
  }

  return (
    <div className="flex flex-col">
      {/* 상단 통계 */}
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <h1 className="text-lg font-bold text-gray-900 mb-4">웨이팅 관리</h1>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Clock className="w-4 h-4 text-amber-500" />} label="대기중" value={stats.waiting} color="text-amber-600" />
          <StatCard icon={<BellRing className="w-4 h-4 text-blue-500" />} label="호출됨" value={stats.called} color="text-blue-600" />
          <StatCard icon={<CheckCircle2 className="w-4 h-4 text-green-500" />} label="입장완료" value={stats.seated} color="text-green-600" />
        </div>
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
            {value !== 'all' && (
              <span className="ml-1.5 text-xs">
                ({list.filter((w) => w.status === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 대기 목록 */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-300">
            불러오는 중...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Users className="w-10 h-10 text-gray-200" />
            <p className="text-sm text-gray-300">대기자가 없습니다</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {filtered.map((w) => {
              const badge = STATUS_BADGE[w.status]
              const actionLabel = ACTION_LABEL[w.status]
              const actionColor = ACTION_COLOR[w.status]
              const isCalled = w.status === 'called'
              const isActive = w.status === 'waiting' || w.status === 'called'

              return (
                <li
                  key={w.id}
                  className={cn(
                    'bg-white px-5 py-4',
                    isCalled && 'bg-blue-50/40'
                  )}
                >
                  {/* 상단: 번호 + 상태 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-11 h-11 rounded-full flex items-center justify-center text-base font-bold',
                          isCalled ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {w.wait_number}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {w.wait_number}번
                          {isCalled && (
                            <span className="ml-2 text-blue-600 text-xs animate-pulse">
                              호출 중
                            </span>
                          )}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                          <Phone className="w-3 h-3" />
                          {maskPhone(w.phone)}
                        </div>
                      </div>
                    </div>

                    <span
                      className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-full border',
                        badge.className
                      )}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* 하단: 시간 + 액션 버튼 */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {new Date(w.created_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} 등록
                    </p>

                    {isActive && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancel(w)}
                          disabled={isPending}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          취소
                        </button>
                        {actionLabel && (
                          <button
                            onClick={() => handleAction(w)}
                            disabled={isPending}
                            className={cn(
                              'flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50',
                              actionColor
                            )}
                          >
                            {w.status === 'waiting' ? (
                              <BellRing className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            {actionLabel}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: string
}) {
  return (
    <div className="bg-gray-50 rounded-2xl px-4 py-3 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        {icon}
        {label}
      </div>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
    </div>
  )
}
