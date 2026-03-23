'use client'

import { useWaitingList, useCurrentCalledNumber } from '@/hooks/use-waiting'
import { useRealtimeWaiting } from '@/hooks/use-realtime-waiting'
import { Waiting } from '@/types/waiting'
import { cn } from '@/lib/utils'
import { Wifi, Clock, CheckCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG: Record<
  Waiting['status'],
  { label: string; color: string; icon: React.ReactNode }
> = {
  waiting: {
    label: '대기중',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  called: {
    label: '호출됨',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: <Wifi className="w-3.5 h-3.5" />,
  },
  seated: {
    label: '입장완료',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: '취소',
    color: 'bg-gray-100 text-gray-400 border-gray-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
}

export function WaitingStatusClient() {
  useRealtimeWaiting()

  const { data: waitingList = [], isLoading } = useWaitingList()
  const { data: currentNumber = 0 } = useCurrentCalledNumber()

  const activeList = waitingList.filter((w) => w.status !== 'cancelled')
  const waitingCount = waitingList.filter((w) => w.status === 'waiting').length

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">실시간 대기 현황</h1>
        <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          실시간
        </div>
      </header>

      <div className="flex flex-col gap-4 p-5">
        {/* 현재 호출 번호 */}
        <div className="bg-blue-600 text-white rounded-3xl p-6 text-center shadow-lg">
          <p className="text-sm font-medium opacity-80 mb-1">현재 호출 번호</p>
          <p className="text-7xl font-black leading-none">
            {currentNumber === 0 ? '-' : currentNumber}
          </p>
          <p className="text-sm opacity-70 mt-2">번</p>
        </div>

        {/* 대기 요약 */}
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex justify-between items-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{waitingCount}</p>
            <p className="text-xs text-gray-400 mt-0.5">대기중</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">
              {waitingList.filter((w) => w.status === 'seated').length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">입장완료</p>
          </div>
          <div className="w-px h-8 bg-gray-100" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{activeList.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">전체</p>
          </div>
        </div>

        {/* 대기 목록 */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-700">대기 목록</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-300 text-sm">
              불러오는 중...
            </div>
          ) : activeList.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-300 text-sm">
              현재 대기자가 없습니다
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {activeList.map((w) => {
                const config = STATUS_CONFIG[w.status]
                const isCalled = w.status === 'called'

                return (
                  <li
                    key={w.id}
                    className={cn(
                      'flex items-center justify-between px-5 py-4 transition-colors',
                      isCalled && 'bg-blue-50/60'
                    )}
                  >
                    {/* 번호 */}
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                          isCalled
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {w.wait_number}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {w.wait_number}번
                          {isCalled && (
                            <span className="ml-2 text-blue-600 text-xs font-semibold animate-pulse">
                              입장해 주세요!
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(w.created_at).toLocaleTimeString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })} 등록
                        </p>
                      </div>
                    </div>

                    {/* 상태 배지 */}
                    <span
                      className={cn(
                        'flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border',
                        config.color
                      )}
                    >
                      {config.icon}
                      {config.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
