import Link from 'next/link'
import { ClipboardList, Monitor, UtensilsCrossed, ChefHat } from 'lucide-react'

const SECTIONS = [
  {
    href: '/admin/waiting',
    icon: Monitor,
    label: '관리자',
    description: '웨이팅 · 메뉴 · 주문 · 테이블 관리',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
  },
  {
    href: '/kiosk/waiting-register',
    icon: ClipboardList,
    label: '키오스크',
    description: '웨이팅 등록 · 대기 현황',
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
  },
  {
    href: '/table/menu',
    icon: UtensilsCrossed,
    label: '테이블 주문',
    description: '메뉴 조회 · 주문 · 주문내역',
    color: 'bg-green-50 text-green-600',
    border: 'border-green-100',
  },
  {
    href: '/kitchen/order-list',
    icon: ChefHat,
    label: '주방',
    description: '주문 접수 · 조리 상태 관리',
    color: 'bg-orange-50 text-orange-600',
    border: 'border-orange-100',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900">레스토랑 관리</h1>
          <p className="text-sm text-gray-400 mt-1">사용할 화면을 선택하세요</p>
        </div>

        <div className="flex flex-col gap-3">
          {SECTIONS.map(({ href, icon: Icon, label, description, color, border }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 bg-white rounded-2xl border ${border} px-5 py-4 shadow-sm active:scale-[0.98] transition-transform`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
