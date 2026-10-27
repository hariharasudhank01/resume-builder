import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Inbox, ListChecks, Search, SearchX, Sparkles, X } from 'lucide-react'
import { DEFAULT_SELECTED, EVIDENCE, MISSING_EVIDENCE, REQUIREMENTS, SOURCES, evidenceById } from '../data/mock'
import { useStore } from '../state/store'
import type { SourceKey } from '../types'
import { EvidenceCard } from '../components/EvidenceCard'
import { Button, Callout, EmptyState, IconButton, PageHeader, Segmented, Skeleton, StatePicker } from '../components/ui'

type SourceFilter = SourceKey | 'all'
type StatusFilter = 'all' | 'confirmed' | 'unconfirmed'
type SortKey = 'relevance' | 'relevance-asc' | 'source'
type DemoState = 'live' | 'loading' | 'no-results' | 'none-selected'

let retrievedOnce = false

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))

export function EvidenceScreen() {
  const { state, dispatch } = useStore()
  const [loading, setLoading] = useState(!retrievedOnce)
  const [source, setSource] = useState<SourceFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [sort, setSort] = useState<SortKey>('relevance')
  const [query, setQuery] = useState('')
  const [demo, setDemo] = useState<DemoState>('live')

  useEffect(() => {
    if (!loading) return
    const t = window.setTimeout(() => {
      retrievedOnce = true
      setLoading(false)
    }, 1300)
    return () => window.clearTimeout(t)
  }, [loading])

  const selected = state.selectedIds
  const isLoading = loading || demo === 'loading'

  const results = useMemo(() => {
    if (demo === 'no-results') return []
    const q = query.trim().toLowerCase()
    const list = EVIDENCE.filter(
      (e) =>
        (source === 'all' || e.source === source) &&
        (status === 'all' || (status === 'confirmed' ? e.status === 'confirmed_by_user' : e.status !== 'confirmed_by_user')) &&
        (!q || [e.title, e.text, e.why, e.section, e.id].some((s) => s.toLowerCase().includes(q))),
    )
    return list.sort((a, b) => (sort === 'relevance-asc' ? a.relevance - b.relevance : sort === 'source' ? a.file.localeCompare(b.file) || b.relevance - a.relevance : b.relevance - a.relevance))
  }, [source, status, sort, query, demo])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: EVIDENCE.length }
    EVIDENCE.forEach((e) => (c[e.source] = (c[e.source] ?? 0) + 1))
    return c
  }, [])

  const filtersActive = source !== 'all' || status !== 'all' || query.trim() !== ''
  const clearFilters = () => {
    setSource('all')
    setStatus('all')
    setQuery('')
  }

  const forceDemo = (d: DemoState) => {
    setDemo(d)
    if (d === 'none-selected') dispatch({ type: 'setSelected', ids: [] })
    if (d === 'live' && selected.length === 0) dispatch({ type: 'setSelected', ids: DEFAULT_SELECTED })
  }

  const target = [state.job.title || 'Untitled role', state.job.company].filter(Boolean).join(' · ')

  return (
    <div className="screen">
      <PageHeader
        title="Select your strongest evidence"
        subtitle="These passages were retrieved from your knowledge base because they relate to the job's requirements. Choose what your resume should draw on."
        meta={
          <>
            <span className="meta-item">
              Targeting <strong>{target}</strong>
            </span>
            <span className="meta-sep" aria-hidden />
            <span className="meta-item">
              <strong>{isLoading ? '–' : EVIDENCE.length}</strong> retrieved
            </span>
            <span className="meta-sep" aria-hidden />
            <span className="meta-item">
              <strong>{selected.length}</strong> selected
            </span>
          </>
        }
        actions={
          <StatePicker
            value={demo}
            onChange={forceDemo}
            options={[
              { value: 'live', label: 'Results available' },
              { value: 'loading', label: 'Loading retrieval' },
              { value: 'no-results', label: 'No matching evidence' },
              { value: 'none-selected', label: 'No evidence selected' },
            ]}
          />
        }
      />

      <div className="ev-layout">
        <section className="ev-main" aria-label="Retrieved evidence">
          <div className="toolbar">
            <Segmented
              label="Filter by source"
              value={source}
              onChange={setSource}
              options={SOURCES.map((s) => ({ value: s.key, label: s.label, count: counts[s.key] ?? 0 }))}
            />
            <div className="toolbar-row">
              <label className="search">
                <Search size={15} aria-hidden />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search within results" aria-label="Search within results" />
                {query && (
                  <IconButton label="Clear search" onClick={() => setQuery('')}>
                    <X size={14} />
                  </IconButton>
                )}
              </label>
              <label className="select-wrap">
                <span className="sr-only">Verification status</span>
                <select className="select" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                  <option value="all">All statuses</option>
                  <option value="confirmed">Confirmed by user</option>
                  <option value="unconfirmed">Estimates and unconfirmed</option>
                </select>
              </label>
              <label className="select-wrap">
                <span className="sr-only">Sort</span>
                <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="relevance">Sort: Most relevant</option>
                  <option value="relevance-asc">Sort: Least relevant</option>
                  <option value="source">Sort: Source file</option>
                </select>
              </label>
            </div>
          </div>

          {!isLoading && demo !== 'no-results' && (
            <div className="missing">
              <div className="missing-head">
                <AlertTriangle size={15} aria-hidden />
                <strong>No strong evidence for {MISSING_EVIDENCE.length} requirements</strong>
              </div>
              <ul>
                {MISSING_EVIDENCE.map((m) => (
                  <li key={m.requirement}>
                    <span className="missing-req">{m.requirement}</span>
                    <span>{m.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="results-meta">
              <span>
                Showing {results.length} of {EVIDENCE.length}
                {filtersActive && ' · filtered'}
              </span>
              <span className="results-actions">
                {filtersActive && (
                  <button className="link-btn" onClick={clearFilters}>
                    Clear filters
                  </button>
                )}
                <button className="link-btn" onClick={() => dispatch({ type: 'setSelected', ids: Array.from(new Set([...selected, ...results.map((r) => r.id)])) })}>
                  Select all shown
                </button>
              </span>
            </div>
          )}

          <div className="ev-list">
            {isLoading &&
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="ev-card skeleton-card" aria-hidden>
                  <Skeleton width={18} height={18} />
                  <div className="ev-body">
                    <div className="ev-top">
                      <Skeleton width="45%" height={14} />
                      <Skeleton width={110} height={12} />
                    </div>
                    <Skeleton height={44} />
                    <Skeleton width="70%" height={11} />
                    <Skeleton width="40%" height={11} />
                  </div>
                </div>
              ))}

            {!isLoading &&
              results.map((e) => <EvidenceCard key={e.id} evidence={e} selected={selected.includes(e.id)} onToggle={() => dispatch({ type: 'toggleEvidence', id: e.id })} />)}

            {!isLoading && results.length === 0 && (
              <EmptyState
                icon={<SearchX size={20} />}
                title={demo === 'no-results' ? 'No relevant evidence found' : 'No evidence matches these filters'}
                action={
                  demo === 'no-results' ? (
                    <Button onClick={() => dispatch({ type: 'view', view: 'knowledge' })}>Open knowledge base</Button>
                  ) : (
                    <Button onClick={clearFilters}>Clear filters</Button>
                  )
                }
              >
                {demo === 'no-results'
                  ? "Your knowledge base doesn't contain anything that supports this job's requirements. ResumeBuilder won't invent a match. Add relevant experience to your knowledge base, or try a different role."
                  : 'Try a different source, status or search term.'}
              </EmptyState>
            )}
          </div>
        </section>

        <SelectionSummary loading={isLoading} />
      </div>
    </div>
  )
}

function SelectionSummary({ loading }: { loading: boolean }) {
  const { state, dispatch } = useStore()
  const selected = state.selectedIds.map(evidenceById).filter((e): e is NonNullable<typeof e> => !!e)

  const byFile = useMemo(() => {
    const m = new Map<string, number>()
    selected.forEach((e) => m.set(e.file, (m.get(e.file) ?? 0) + 1))
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [selected])

  const allReqs = REQUIREMENTS.flatMap((g) => g.items)
  const covered = new Set(selected.flatMap((e) => e.requirements))
  const coveredCount = allReqs.filter((r) => covered.has(r)).length

  const hasDraft = !!state.resume
  const selectionChanged = hasDraft && !sameSet(state.draftSelection, state.selectedIds)

  const generate = () => {
    if (!hasDraft || selectionChanged) dispatch({ type: 'clearDraft' })
    dispatch({ type: 'stage', stage: 2 })
  }

  return (
    <aside className="panel summary" aria-label="Selection summary">
      <div className="summary-count">
        <span className="summary-num">{selected.length}</span>
        <span className="muted">
          evidence {selected.length === 1 ? 'chunk' : 'chunks'} selected
          <br />
          of {EVIDENCE.length} retrieved
        </span>
      </div>

      {selected.length === 0 ? (
        <EmptyState icon={<Inbox size={18} />} title="No evidence selected">
          Select the passages that best support this role. Your resume will only include claims backed by what you select.
        </EmptyState>
      ) : (
        <>
          <div className="summary-section">
            <div className="summary-label">By source</div>
            <ul className="file-bars">
              {byFile.map(([file, n]) => (
                <li key={file}>
                  <span className="mono">{file}</span>
                  <span className="file-bar">
                    <span style={{ width: `${(n / selected.length) * 100}%` }} />
                  </span>
                  <span className="file-n">{n}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="summary-section">
            <div className="summary-label">
              Requirements with evidence <span className="muted">{coveredCount}/{allReqs.length}</span>
            </div>
            <div className="req-coverage">
              {allReqs.map((r) => (
                <span key={r} className={`req-chip ${covered.has(r) ? 'on' : ''}`}>
                  {covered.has(r) ? <Check size={11} strokeWidth={3} aria-label="covered" /> : <span className="req-chip-dot" aria-label="not covered" />}
                  {r}
                </span>
              ))}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-label">Selected</div>
            <ul className="selected-list">
              {selected.map((e) => (
                <li key={e.id}>
                  <span className="selected-text">
                    <span>{e.title}</span>
                    <span className="mono muted">{e.id}</span>
                  </span>
                  <IconButton label={`Remove ${e.title}`} onClick={() => dispatch({ type: 'toggleEvidence', id: e.id })}>
                    <X size={14} />
                  </IconButton>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="summary-actions">
        {selectionChanged && <Callout tone="warning">Your selection changed. Regenerating replaces the edits in your current draft.</Callout>}
        {hasDraft && !selectionChanged ? (
          <Button variant="primary" size="lg" className="full" iconRight={<ArrowRight size={16} />} onClick={() => dispatch({ type: 'stage', stage: 2 })}>
            Continue to resume
          </Button>
        ) : (
          <Button variant="primary" size="lg" className="full" icon={<Sparkles size={15} />} disabled={selected.length === 0 || loading} onClick={generate}>
            {selectionChanged ? 'Regenerate resume draft' : 'Generate resume draft'}
          </Button>
        )}
        {selectionChanged && (
          <Button variant="ghost" className="full" onClick={() => dispatch({ type: 'stage', stage: 2 })}>
            Keep current draft
          </Button>
        )}
        {!hasDraft && selected.length > 0 && !loading && (
          <p className="muted small center">
            <ListChecks size={13} aria-hidden /> Ready to generate from {selected.length} selected {selected.length === 1 ? 'chunk' : 'chunks'}
          </p>
        )}
        <Button variant="ghost" className="full" icon={<ArrowLeft size={15} />} onClick={() => dispatch({ type: 'stage', stage: 0 })}>
          Back to job description
        </Button>
      </div>
    </aside>
  )
}
