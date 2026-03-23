import Link from 'next/link'
import { ClipboardList, UtensilsCrossed, ShoppingBag, LayoutGrid } from 'lucide-react'

const NAV = [
  { href: '/admin/waiting', label: '웨이팅', icon: ClipboardList },
  { href: '/admin/menu', label: '메뉴', icon: UtensilsCrossed },
  { href: '/admin/order', label: '주문', icon: ShoppingBag },
  { href: '/admin/table', label: '테이블', icon: LayoutGrid },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-5 py-3">
        <p className="text-xs text-gray-400 font-medium">관리자</p>
      </header>

      <main className="flex-1 pb-20">{children}</main>

      {/* 하단 탭 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-10">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-400 hover:text-blue-600 transition-colors"
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
