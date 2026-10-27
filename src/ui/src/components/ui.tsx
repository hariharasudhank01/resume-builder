import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, CircleDashed, CircleHelp, Info, Loader2, MinusCircle, XCircle } from 'lucide-react'
import type { Coverage, EvidenceStatus, ScoreLevel } from '../types'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
}

export function Button({ variant = 'secondary', size = 'md', icon, iconRight, loading, children, className = '', disabled, ...rest }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Loader2 size={15} className="spin" aria-hidden /> : icon}
      {children && <span>{children}</span>}
      {iconRight}
    </button>
  )
}

export function IconButton({ label, children, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={`icon-btn ${className}`} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  )
}

export function Tag({ children, tone = 'neutral', icon }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'muted' | 'warning'; icon?: ReactNode }) {
  return (
    <span className={`tag tag-${tone}`}>
      {icon}
      {children}
    </span>
  )
}

const STATUS_META: Record<EvidenceStatus, { label: string; tone: string; icon: ReactNode }> = {
  confirmed_by_user: { label: 'Confirmed by user', tone: 'success', icon: <CheckCircle2 size={13} aria-hidden /> },
  user_reported_estimate: { label: 'User estimate', tone: 'warning', icon: <CircleHelp size={13} aria-hidden /> },
  needs_confirmation: { label: 'Needs confirmation', tone: 'muted', icon: <CircleDashed size={13} aria-hidden /> },
}

export function StatusBadge({ status }: { status: EvidenceStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`badge badge-${meta.tone}`} title="Recorded in your knowledge base. Not independently verified.">
      {meta.icon}
      {meta.label}
    </span>
  )
}

export function relevanceLabel(score: number) {
  if (score >= 80) return 'High'
  if (score >= 60) return 'Medium'
  return 'Low'
}

/** Five-segment meter plus label and number, so level never relies on colour alone. */
export function RelevanceMeter({ score }: { score: number }) {
  const filled = Math.round(score / 20)
  const label = relevanceLabel(score)
  return (
    <span className={`relevance relevance-${label.toLowerCase()}`} title="Retrieval relevance (semantic similarity), not a probability">
      <span className="relevance-bars" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={i < filled ? 'on' : ''} />
        ))}
      </span>
      <span className="relevance-text">
        <strong>{score}</strong>
        <span className="muted">/100 · {label}</span>
      </span>
    </span>
  )
}

export function scoreLevel(score: number): ScoreLevel {
  if (score >= 80) return 'strong'
  if (score >= 65) return 'moderate'
  return 'weak'
}

const LEVEL_META: Record<ScoreLevel, { label: string; icon: ReactNode }> = {
  strong: { label: 'Strong', icon: <CheckCircle2 size={14} aria-hidden /> },
  moderate: { label: 'Moderate', icon: <MinusCircle size={14} aria-hidden /> },
  weak: { label: 'Needs work', icon: <AlertTriangle size={14} aria-hidden /> },
}

export function LevelBadge({ score }: { score: number }) {
  const level = scoreLevel(score)
  return (
    <span className={`badge badge-level-${level}`}>
      {LEVEL_META[level].icon}
      {LEVEL_META[level].label}
    </span>
  )
}

const COVERAGE_META: Record<Coverage, { label: string; icon: ReactNode }> = {
  strong: { label: 'Strong', icon: <CheckCircle2 size={14} aria-hidden /> },
  partial: { label: 'Partial', icon: <MinusCircle size={14} aria-hidden /> },
  missing: { label: 'Missing', icon: <XCircle size={14} aria-hidden /> },
}

export function CoverageBadge({ coverage }: { coverage: Coverage }) {
  return (
    <span className={`badge badge-coverage-${coverage}`}>
      {COVERAGE_META[coverage].icon}
      {COVERAGE_META[coverage].label}
    </span>
  )
}

export function ProgressBar({ value, level }: { value: number; level?: ScoreLevel }) {
  return (
    <span className={`progress ${level ? `progress-${level}` : ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value}%` }} />
    </span>
  )
}

export function Callout({ tone = 'info', title, children, action }: { tone?: 'info' | 'warning' | 'danger' | 'success'; title?: ReactNode; children?: ReactNode; action?: ReactNode }) {
  const icon =
    tone === 'warning' ? <AlertTriangle size={16} /> : tone === 'danger' ? <XCircle size={16} /> : tone === 'success' ? <CheckCircle2 size={16} /> : <Info size={16} />
  return (
    <div className={`callout callout-${tone}`} role={tone === 'danger' ? 'alert' : undefined}>
      <span className="callout-icon" aria-hidden>
        {icon}
      </span>
      <div className="callout-body">
        {title && <div className="callout-title">{title}</div>}
        {children && <div className="callout-text">{children}</div>}
      </div>
      {action && <div className="callout-action">{action}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon" aria-hidden>
        {icon}
      </div>
      <div className="empty-title">{title}</div>
      {children && <p className="empty-text">{children}</p>}
      {action}
    </div>
  )
}

export function Skeleton({ width = '100%', height = 12, className = '' }: { width?: number | string; height?: number; className?: string }) {
  return <span className={`skeleton ${className}`} style={{ width, height }} aria-hidden />
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { value: T; label: ReactNode; count?: number }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div className="segmented" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="tab" aria-selected={value === o.value} className={value === o.value ? 'active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span className="segmented-count">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

export function PageHeader({ title, subtitle, meta, actions }: { title: string; subtitle?: ReactNode; meta?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div className="page-header-main">
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {meta && <div className="page-meta">{meta}</div>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}

/** Lets reviewers force each designed interaction state. Not part of the product UI. */
export function StatePicker<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <label className="state-picker">
      <span>Prototype state</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
