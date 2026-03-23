'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NumPad } from './num-pad'
import { useRegisterWaiting } from '@/hooks/use-waiting'
import { Users } from 'lucide-react'

interface Props {
  waitingCount: number
}

function formatPhone(digits: string): string {
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export function WaitingRegisterClient({ waitingCount }: Props) {
  const [digits, setDigits] = useState('')
  const router = useRouter()
  const { mutate: register, isPending } = useRegisterWaiting()

  const isComplete = digits.length === 11
  const formatted = formatPhone(digits) || '010-0000-0000'
  const isEmpty = digits.length === 0

  function handlePress(key: string) {
    if (key === 'delete') {
      setDigits((d) => d.slice(0, -1))
      return
    }
    if (key === 'confirm') {
      if (!isComplete) return
      register(digits, {
        onSuccess: (data) => {
          router.push(`/kiosk/register-complete?number=${data.wait_number}`)
        },
      })
      return
    }
    if (digits.length >= 11) return
    setDigits((d) => d + key)
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-10">
      {/* 상단 헤더 */}
      <div className="w-full text-center space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">웨이팅 등록</h1>
        <p className="text-gray-500 text-sm">전화번호를 입력하면 대기번호를 받을 수 있습니다</p>
      </div>

      {/* 현재 대기 현황 */}
      <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl">
        <Users className="w-5 h-5" />
        <span className="font-semibold text-base">
          현재 대기 <span className="text-xl">{waitingCount}</span>팀
        </span>
      </div>

      {/* 전화번호 표시 */}
      <div className="w-full">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-6 py-5 text-center">
          <p className="text-sm text-gray-400 mb-2">전화번호</p>
          <p
            className={`text-4xl font-bold tracking-widest transition-colors ${
              isEmpty ? 'text-gray-200' : isComplete ? 'text-blue-600' : 'text-gray-800'
            }`}
          >
            {isEmpty ? '010-0000-0000' : formatted}
          </p>
        </div>
      </div>

      {/* 숫자 패드 */}
      <div className="w-full">
        <NumPad onPress={handlePress} disabled={isPending} canConfirm={isComplete} />
      </div>

      {/* 안내 문구 */}
      <p className="text-xs text-gray-400 text-center">
        입력한 번호로 호출 알림이 발송됩니다
      </p>
    </div>
  )
}
