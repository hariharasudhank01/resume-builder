import { useEffect, useRef } from 'react'
import { FileText, Sparkles, X } from 'lucide-react'
import { evidenceById } from '../data/mock'
import { IconButton, StatusBadge } from './ui'

export interface PopoverTarget {
  evidenceIds: string[]
  generated: string
  rect: DOMRect
}

const WIDTH = 380

export function EvidencePopover({ target, onClose }: { target: PopoverTarget; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as HTMLElement).closest('.ref-chip')) onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [onClose])

  const left = Math.max(12, Math.min(target.rect.left - 12, window.innerWidth - WIDTH - 12))
  const below = target.rect.bottom + 8
  const top = below + 360 > window.innerHeight ? Math.max(12, target.rect.top - 8 - 360) : below

  const items = target.evidenceIds.map(evidenceById).filter((e): e is NonNullable<typeof e> => !!e)

  return (
    <div ref={ref} className="popover" role="dialog" aria-label="Supporting evidence" tabIndex={-1} style={{ left, top, width: WIDTH }}>
      <div className="popover-head">
        <span>Supporting evidence</span>
        <IconButton label="Close" onClick={onClose}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="popover-generated">
        <div className="popover-label">
          <Sparkles size={12} aria-hidden /> Generated wording
        </div>
        <p>{target.generated}</p>
      </div>

      {items.map((e) => (
        <div key={e.id} className="popover-evidence">
          <div className="popover-label">
            <FileText size={12} aria-hidden /> Original evidence
          </div>
          <blockquote>{e.text}</blockquote>
          <dl className="popover-meta">
            <div>
              <dt>Source</dt>
              <dd className="mono">{e.file}</dd>
            </div>
            <div>
              <dt>Evidence ID</dt>
              <dd className="mono">{e.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={e.status} />
              </dd>
            </div>
          </dl>
          {e.context && e.status !== 'confirmed_by_user' && <p className="popover-note">{e.context}</p>}
        </div>
      ))}
      <p className="popover-foot">Status reflects what you recorded in your knowledge base. ResumeBuilder does not independently verify claims.</p>
    </div>
  )
}
