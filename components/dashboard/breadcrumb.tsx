
"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BreadcrumbItem {
  href: string
  label: string
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Always start with dashboard
    breadcrumbs.push({ href: '/dashboard', label: 'Главная' })
    
    // Map segments to readable names
    const segmentMap: Record<string, string> = {
      'investments': 'Инвестиции',
      'deposit': 'Пополнение',
      'withdraw': 'Вывод средств',
      'transactions': 'Транзакции',
      'referrals': 'Рефералы',
      'profile': 'Профиль',
      'settings': 'Настройки',
      'support': 'Поддержка'
    }
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      if (index === 0 && segment === 'dashboard') return // Skip dashboard as it's already added
      
      currentPath += `/${segment}`
      const label = segmentMap[segment] || segment
      breadcrumbs.push({ href: currentPath, label })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = getBreadcrumbs()
  
  if (breadcrumbs.length <= 1) return null
  
  return (
    <div className="flex items-center space-x-2 mb-6 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      <Home className="h-4 w-4 text-white/60" />
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-white/40" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-white font-medium text-sm">{item.label}</span>
          ) : (
            <Link href={item.href}>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white h-auto p-1 text-sm">
                {item.label}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
