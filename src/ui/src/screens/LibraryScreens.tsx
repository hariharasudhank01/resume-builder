import { ArrowRight, BookOpen, FileText, History } from 'lucide-react'
import { EVIDENCE, SOURCES } from '../data/mock'
import { useStore } from '../state/store'
import { Button, PageHeader, StatusBadge, Tag } from '../components/ui'

export function KnowledgeBaseScreen() {
  const files = SOURCES.filter((s) => s.file)
  return (
    <div className="screen">
      <PageHeader title="Knowledge Base" subtitle="The Markdown files ResumeBuilder retrieves evidence from. Edit them to change what your resumes can say." />
      <div className="kb-grid">
        {files.map((f) => {
          const items = EVIDENCE.filter((e) => e.source === f.key)
          return (
            <section key={f.key} className="panel kb-card">
              <div className="kb-head">
                <FileText size={16} aria-hidden />
                <span className="mono">{f.file}</span>
                <Tag tone="muted">{items.length} chunks</Tag>
              </div>
              <ul className="kb-list">
                {items.map((e) => (
                  <li key={e.id}>
                    <span>{e.title}</span>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      <p className="muted small">
        <BookOpen size={12} aria-hidden /> In the full product this view lets you open, edit and re-index each file.
      </p>
    </div>
  )
}

const HISTORY = [
  { role: 'Graduate Data Engineer', company: 'Harbourline Analytics', date: 'Today', score: 78, current: true },
  { role: 'Junior Data Analyst', company: 'Southbank Health', date: '21 Oct 2026', score: 81 },
  { role: 'AI Engineer (Graduate)', company: 'Meridian Labs', date: '14 Oct 2026', score: 72 },
]

export function HistoryScreen() {
  const { dispatch } = useStore()
  return (
    <div className="screen">
      <PageHeader title="Resume History" subtitle="Every tailored resume you've built, with the evidence and evaluation it was based on." />
      <div className="panel table-panel">
        <table className="coverage">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Updated</th>
              <th>Match</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {HISTORY.map((h) => (
              <tr key={h.role}>
                <td className="req-cell">
                  <History size={14} aria-hidden className="muted" /> {h.role} {h.current && <Tag tone="accent">In progress</Tag>}
                </td>
                <td>{h.company}</td>
                <td className="muted">{h.date}</td>
                <td>{h.score}/100</td>
                <td className="right">
                  {h.current ? (
                    <Button size="sm" iconRight={<ArrowRight size={13} />} onClick={() => dispatch({ type: 'view', view: 'build' })}>
                      Resume
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled>
                      Open
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
