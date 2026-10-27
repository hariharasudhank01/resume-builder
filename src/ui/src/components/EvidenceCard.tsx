import { useState, type MouseEvent } from 'react'
import { ChevronDown, FileText } from 'lucide-react'
import type { Evidence } from '../types'
import { RelevanceMeter, StatusBadge, Tag } from './ui'

interface Props {
  evidence: Evidence
  selected: boolean
  onToggle: () => void
}

export function EvidenceCard({ evidence: e, selected, onToggle }: Props) {
  const [expanded, setExpanded] = useState(false)
  const inputId = `ev-${e.id}`

  // Whole card toggles selection, except interactive children.
  const onCardClick = (ev: MouseEvent) => {
    if ((ev.target as HTMLElement).closest('button, input, a, label')) return
    onToggle()
  }

  return (
    <article className={`ev-card ${selected ? 'selected' : ''}`} onClick={onCardClick} aria-labelledby={`${inputId}-title`}>
      <div className="ev-check">
        <input id={inputId} type="checkbox" className="checkbox" checked={selected} onChange={onToggle} aria-labelledby={`${inputId}-title`} />
      </div>

      <div className="ev-body">
        <div className="ev-top">
          <label htmlFor={inputId} id={`${inputId}-title`} className="ev-title">
            {e.title}
          </label>
          <RelevanceMeter score={e.relevance} />
        </div>

        <blockquote className="ev-quote">{e.text}</blockquote>

        <p className="ev-why">
          <span className="ev-why-label">Why it matches</span>
          {e.why}
        </p>

        {expanded && (
          <div className="ev-more">
            {e.context && (
              <div>
                <div className="ev-more-label">More context from {e.file}</div>
                <p>{e.context}</p>
              </div>
            )}
            <div>
              <div className="ev-more-label">Matches requirements</div>
              <div className="tag-row">
                {e.requirements.map((r) => (
                  <Tag key={r} tone="muted">
                    {r}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="ev-foot">
          <span className="ev-source">
            <FileText size={13} aria-hidden />
            <span className="mono">{e.file}</span>
            <span className="dot" aria-hidden>
              ·
            </span>
            <span>{e.section}</span>
          </span>
          <span className="ev-foot-right">
            <span className="mono id-chip">{e.id}</span>
            <StatusBadge status={e.status} />
            <button className="link-btn subtle" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Less' : 'More'}
              <ChevronDown size={14} className={expanded ? 'rot-180' : ''} />
            </button>
          </span>
        </div>
      </div>
    </article>
  )
}
