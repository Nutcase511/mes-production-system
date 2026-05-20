import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs: Breadcrumb[]
  titleClass?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs, titleClass, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-blue-200/60 mb-2">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-cyan-300 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-blue-100">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${titleClass || 'text-blue-50'}`}>{title}</h1>
          {subtitle && <p className="text-sm text-blue-200/60 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
