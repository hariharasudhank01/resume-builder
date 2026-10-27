import type { ReactNode } from 'react'
import { BookOpen, Check, ChevronsUpDown, CloudOff, FilePlus2, History, Loader2, RotateCcw } from 'lucide-react'
import { STAGES, useStore, type Stage, type View } from '../state/store'

const NAV: { view: View; label: string; icon: ReactNode }[] = [
  { view: 'build', label: 'Build Resume', icon: <FilePlus2 size={16} /> },
  { view: 'knowledge', label: 'Knowledge Base', icon: <BookOpen size={16} /> },
  { view: 'history', label: 'Resume History', icon: <History size={16} /> },
]

export function Sidebar() {
  const { state, dispatch } = useStore()
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden>
          <svg viewBox="0 0 20 20" width="20" height="20">
            <rect x="1" y="1" width="18" height="18" rx="5" fill="currentColor" />
            <path d="M6 6.5h8M6 10h8M6 13.5h4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <span className="brand-name">ResumeBuilder</span>
      </div>

      <nav className="nav" aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.view}
            className={`nav-item ${state.view === item.view ? 'active' : ''}`}
            aria-current={state.view === item.view ? 'page' : undefined}
            onClick={() => dispatch({ type: 'view', view: item.view })}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-foot">
        <button className="nav-item subtle" onClick={() => dispatch({ type: 'reset' })} title="Clear prototype data and start again">
          <RotateCcw size={15} />
          <span>Reset prototype</span>
        </button>
        <button className="profile">
          <span className="avatar" aria-hidden>
            HK
          </span>
          <span className="profile-text">
            <span className="profile-name">Hariharasudhan K</span>
            <span className="profile-sub">6 knowledge files</span>
          </span>
          <ChevronsUpDown size={14} className="muted" />
        </button>
      </div>
    </aside>
  )
}

export function SaveIndicator() {
  const { saveStatus } = useStore()
  const content =
    saveStatus === 'saving' ? (
      <>
        <Loader2 size={13} className="spin" /> Saving…
      </>
    ) : saveStatus === 'unsaved' ? (
      <>
        <CloudOff size={13} /> Unsaved changes
      </>
    ) : (
      <>
        <Check size={13} /> Saved
      </>
    )
  return (
    <span className={`save save-${saveStatus}`} role="status" aria-live="polite">
      {content}
    </span>
  )
}

export function Stepper() {
  const { state, dispatch } = useStore()
  return (
    <ol className="stepper" aria-label="Workflow progress">
      {STAGES.map((label, i) => {
        const stage = i as Stage
        const status = stage === state.stage ? 'active' : stage <= state.unlocked ? 'done' : 'future'
        return (
          <li key={label} className={`step step-${status}`}>
            <button
              disabled={status === 'future'}
              aria-current={status === 'active' ? 'step' : undefined}
              onClick={() => dispatch({ type: 'stage', stage })}
            >
              <span className="step-num">{status === 'done' ? <Check size={12} strokeWidth={3} /> : String(i + 1).padStart(2, '0')}</span>
              <span className="step-label">{label}</span>
            </button>
            {i < STAGES.length - 1 && <span className="step-line" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}

export function WorkflowBar() {
  const { state } = useStore()
  const target = [state.job.title, state.job.company].filter(Boolean).join(' · ')
  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="topbar-crumb">Build Resume</span>
        {target && (
          <>
            <span className="topbar-sep">/</span>
            <span className="topbar-target">{target}</span>
          </>
        )}
      </div>
      <Stepper />
      <SaveIndicator />
    </header>
  )
}
