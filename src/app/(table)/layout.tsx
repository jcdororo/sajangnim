import Link from 'next/link'
import { UtensilsCrossed, ClipboardList } from 'lucide-react'

const NAV = [
  { href: '/table/menu', label: '메뉴', icon: UtensilsCrossed },
  { href: '/table/order-history', label: '주문내역', icon: ClipboardList },
]

export default function TableLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 pb-16">{children}</main>
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
