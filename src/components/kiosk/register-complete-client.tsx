'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { CheckCircle } from 'lucide-react'

interface Props {
  waitNumber: number
  statusUrl: string
}

export function RegisterCompleteClient({ waitNumber, statusUrl }: Props) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(30)

  // 30초 후 자동으로 등록 화면으로 돌아감
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/kiosk/waiting-register')
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router])

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-10 text-center">
      {/* 성공 아이콘 */}
      <div className="flex flex-col items-center gap-3">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1 className="text-3xl font-bold text-gray-900">등록 완료!</h1>
        <p className="text-gray-500 text-sm">웨이팅 등록이 완료되었습니다</p>
      </div>

      {/* 대기 번호 */}
      <div className="bg-blue-600 text-white rounded-3xl px-10 py-8 shadow-lg w-full">
        <p className="text-sm font-medium opacity-80 mb-1">내 대기 번호</p>
        <p className="text-8xl font-black leading-none">{waitNumber}</p>
        <p className="text-sm opacity-70 mt-3">번</p>
      </div>

      {/* QR 코드 */}
      <div className="flex flex-col items-center gap-4 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 w-full">
        <p className="text-sm font-semibold text-gray-700">실시간 대기 현황 확인</p>
        <div className="p-3 bg-white rounded-xl border border-gray-100">
          <QRCode value={statusUrl} size={140} />
        </div>
        <p className="text-xs text-gray-400">QR코드를 스캔하면 대기 현황을 실시간으로 확인할 수 있습니다</p>
      </div>

      {/* 자동 복귀 카운트다운 */}
      <p className="text-sm text-gray-400">
        {countdown}초 후 처음 화면으로 돌아갑니다
      </p>
    </div>
  )
}
