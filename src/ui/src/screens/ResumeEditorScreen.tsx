import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode,
  Link2,
  Lock,
  Redo2,
  RefreshCw,
  RotateCcw,
  Trash2,
  Undo2,
} from 'lucide-react'
import { evidenceById, generateResume } from '../data/mock'
import { toLatex } from '../lib/latex'
import { useStore } from '../state/store'
import type { Bullet, Entry, Resume, TemplateKey } from '../types'
import { EvidencePopover, type PopoverTarget } from '../components/EvidencePopover'
import { ResumePreview } from '../components/ResumePreview'
import { Button, Callout, IconButton, PageHeader, Segmented, Skeleton, StatePicker, Tag } from '../components/ui'

type DemoState = 'live' | 'generating' | 'error'
type SectionKey = 'summary' | 'skills' | 'experience' | 'projects' | 'education'

const nextWording = (b: Bullet) => {
  const options = [b.original, ...b.alternatives]
  const i = options.indexOf(b.text)
  return options[(i + 1) % options.length]
}

export function ResumeEditorScreen() {
  const { state, dispatch } = useStore()
  const { resume } = state
  const [demo, setDemo] = useState<DemoState>('live')
  const [failed, setFailed] = useState(false)
  const [popover, setPopover] = useState<PopoverTarget | null>(null)
  const [mode, setMode] = useState<'preview' | 'latex'>('preview')
  const [latexReady, setLatexReady] = useState(false)
  const [latexBusy, setLatexBusy] = useState(false)
  const [busy, setBusy] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({ summary: true, skills: true, experience: true, projects: true, education: false })
  const [pages, setPages] = useState(1)
  const [copied, setCopied] = useState(false)

  const generating = demo === 'generating' || (!resume && !failed && demo !== 'error')
  const showError = demo === 'error' || failed

  // Mock generation whenever there is no draft.
  useEffect(() => {
    if (resume || demo !== 'live' || failed) return
    const t = window.setTimeout(() => dispatch({ type: 'draftReady', resume: generateResume(state.selectedIds) }), 1600)
    return () => window.clearTimeout(t)
  }, [resume, demo, failed, dispatch, state.selectedIds])

  const edit = useCallback((key: string, update: (r: Resume) => Resume) => dispatch({ type: 'edit', key, update }), [dispatch])

  const updateBullet = (section: 'experience' | 'projects', entryId: string, bulletId: string, patch: (b: Bullet) => Bullet | null) =>
    edit(`${bulletId}`, (r) => ({
      ...r,
      [section]: r[section].map((e) =>
        e.id !== entryId ? e : { ...e, bullets: e.bullets.map((bl) => (bl.id === bulletId ? patch(bl) : bl)).filter((bl): bl is Bullet => bl !== null) },
      ),
    }))

  const withBusy = (key: string, fn: () => void) => {
    setBusy((s) => new Set(s).add(key))
    window.setTimeout(() => {
      fn()
      setBusy((s) => {
        const n = new Set(s)
        n.delete(key)
        return n
      })
    }, 900)
  }

  const regenerateEntry = (section: 'experience' | 'projects', entry: Entry) =>
    withBusy(entry.id, () =>
      edit(`regen-${entry.id}-${Date.now()}`, (r) => ({
        ...r,
        [section]: r[section].map((e) => (e.id !== entry.id ? e : { ...e, bullets: e.bullets.map((bl) => ({ ...bl, text: nextWording(bl) })) })),
      })),
    )

  const forceDemo = (d: DemoState) => {
    setDemo(d)
    setFailed(false)
    if (d === 'live' && !resume) dispatch({ type: 'draftReady', resume: generateResume(state.selectedIds) })
  }

  const generateLatex = () => {
    setLatexBusy(true)
    window.setTimeout(() => {
      setLatexBusy(false)
      setLatexReady(true)
      setMode('latex')
    }, 900)
  }

  const latex = resume ? toLatex(resume, state.template) : ''
  const copyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latex)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  const downloadLatex = () => {
    const url = URL.createObjectURL(new Blob([latex], { type: 'application/x-tex' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'hariharasudhan-k-resume.tex'
    a.click()
    URL.revokeObjectURL(url)
  }

  const openRefs = (ev: React.MouseEvent<HTMLButtonElement>, evidenceIds: string[], generated: string) => {
    const rect = ev.currentTarget.getBoundingClientRect()
    setPopover((p) => (p && p.generated === generated ? null : { evidenceIds, generated, rect }))
  }

  const toggle = (k: SectionKey) => setOpen((o) => ({ ...o, [k]: !o[k] }))
  const editedCount = resume ? [resume.summary, ...resume.experience.flatMap((e) => e.bullets), ...resume.projects.flatMap((e) => e.bullets)].filter((b) => b.text !== b.original).length : 0

  return (
    <div className="screen">
      <PageHeader
        title="Review your tailored resume"
        subtitle="Edit any wording. Every claim links back to the evidence it came from."
        meta={
          resume && !generating && !showError ? (
            <>
              <span className="meta-item">
                Draft <strong>v{state.resumeVersion}</strong>
              </span>
              <span className="meta-sep" aria-hidden />
              <span className="meta-item">
                From <strong>{state.draftSelection.length}</strong> evidence chunks
              </span>
              {editedCount > 0 && (
                <>
                  <span className="meta-sep" aria-hidden />
                  <span className="meta-item">
                    <strong>{editedCount}</strong> edited
                  </span>
                </>
              )}
            </>
          ) : undefined
        }
        actions={
          <StatePicker
            value={generating ? 'generating' : showError ? 'error' : 'live'}
            onChange={forceDemo}
            options={[
              { value: 'live', label: 'Draft ready' },
              { value: 'generating', label: 'Resume generating' },
              { value: 'error', label: 'Generation error' },
            ]}
          />
        }
      />

      {showError ? (
        <div className="panel error-panel">
          <Callout
            tone="danger"
            title="We couldn't generate your resume draft"
            action={
              <Button variant="primary" icon={<RefreshCw size={15} />} onClick={() => forceDemo('live')}>
                Try again
              </Button>
            }
          >
            The generation service did not respond. Your job description and evidence selection are saved, so nothing needs to be redone.
          </Callout>
          <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={() => dispatch({ type: 'stage', stage: 1 })}>
            Back to evidence
          </Button>
        </div>
      ) : generating || !resume ? (
        <GeneratingSkeleton />
      ) : (
        <>
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <IconButton label="Undo" disabled={state.past.length === 0} onClick={() => dispatch({ type: 'undo' })}>
                <Undo2 size={16} />
              </IconButton>
              <IconButton label="Redo" disabled={state.future.length === 0} onClick={() => dispatch({ type: 'redo' })}>
                <Redo2 size={16} />
              </IconButton>
              <span className="toolbar-divider" />
              <label className="select-wrap compact">
                <span className="muted small">Template</span>
                <select className="select" value={state.template} onChange={(e) => dispatch({ type: 'template', template: e.target.value as TemplateKey })}>
                  <option value="classic">Classic serif</option>
                  <option value="compact">Compact</option>
                  <option value="modern">Modern sans</option>
                </select>
              </label>
            </div>
            <div className="toolbar-group">
              <Button variant="ghost" icon={<ArrowLeft size={15} />} onClick={() => dispatch({ type: 'stage', stage: 1 })}>
                Back to evidence
              </Button>
              {latexReady ? (
                <Button variant="primary" iconRight={<ArrowRight size={16} />} onClick={() => dispatch({ type: 'stage', stage: 3 })}>
                  Evaluate resume
                </Button>
              ) : (
                <Button variant="primary" icon={<FileCode size={15} />} loading={latexBusy} onClick={generateLatex}>
                  Generate LaTeX
                </Button>
              )}
            </div>
          </div>

          <div className="editor-grid">
            <div className="editor-col">
              <Section title="Professional Summary" open={open.summary} onToggle={() => toggle('summary')} action={
                <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} loading={busy.has('summary')} onClick={() => withBusy('summary', () => edit(`regen-summary-${Date.now()}`, (r) => ({ ...r, summary: { ...r.summary, text: nextWording(r.summary) } })))}>
                  Regenerate
                </Button>
              }>
                <BulletEditor
                  bullet={resume.summary}
                  block
                  busy={busy.has('summary')}
                  onChange={(text) => edit('summary', (r) => ({ ...r, summary: { ...r.summary, text } }))}
                  onRestore={() => edit('summary-restore', (r) => ({ ...r, summary: { ...r.summary, text: r.summary.original } }))}
                  onRefs={openRefs}
                />
              </Section>

              <Section title="Technical Skills" open={open.skills} onToggle={() => toggle('skills')}>
                <div className="skill-rows">
                  {resume.skills.map((s) => (
                    <div key={s.id} className="skill-row">
                      <span className="skill-label">{s.label}</span>
                      <input
                        className="input"
                        value={s.items}
                        aria-label={`${s.label} skills`}
                        onChange={(e) => edit(s.id, (r) => ({ ...r, skills: r.skills.map((x) => (x.id === s.id ? { ...x, items: e.target.value } : x)) }))}
                      />
                      <RefChip ids={s.evidenceIds} onClick={(ev) => openRefs(ev, s.evidenceIds, `${s.label}: ${s.items}`)} />
                    </div>
                  ))}
                </div>
              </Section>

              {(['experience', 'projects'] as const).map((section) => (
                <Section key={section} title={section === 'experience' ? 'Work Experience' : 'Projects'} count={resume[section].length} open={open[section]} onToggle={() => toggle(section)}>
                  {resume[section].length === 0 && <p className="muted small">No selected evidence supports this section. Select more evidence to include it.</p>}
                  {resume[section].map((entry) => (
                    <div key={entry.id} className="entry">
                      <div className="entry-head">
                        <div>
                          <div className="entry-title">{entry.heading}</div>
                          <div className="entry-sub">
                            {entry.subheading} · {entry.dates}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" icon={<RefreshCw size={13} />} loading={busy.has(entry.id)} onClick={() => regenerateEntry(section, entry)}>
                          Regenerate
                        </Button>
                      </div>
                      <ul className="bullet-list">
                        {entry.bullets.map((bl) => (
                          <li key={bl.id}>
                            <BulletEditor
                              bullet={bl}
                              busy={busy.has(bl.id) || busy.has(entry.id)}
                              onChange={(text) => updateBullet(section, entry.id, bl.id, (x) => ({ ...x, text }))}
                              onRestore={() => updateBullet(section, entry.id, bl.id, (x) => ({ ...x, text: x.original }))}
                              onRegenerate={bl.alternatives.length ? () => withBusy(bl.id, () => updateBullet(section, entry.id, bl.id, (x) => ({ ...x, text: nextWording(x) }))) : undefined}
                              onRemove={() => updateBullet(section, entry.id, bl.id, () => null)}
                              onRefs={openRefs}
                            />
                          </li>
                        ))}
                        {entry.bullets.length === 0 && <li className="muted small">All bullets removed. Use undo to restore them.</li>}
                      </ul>
                    </div>
                  ))}
                </Section>
              ))}

              <Section title="Education" count={resume.education.length} open={open.education} onToggle={() => toggle('education')}>
                <div className="locked-note">
                  <Lock size={13} aria-hidden /> Preserved exactly as recorded in education.md. ResumeBuilder does not generate grades, awards or coursework.
                </div>
                {resume.education.map((e) => (
                  <div key={e.id} className="entry locked">
                    <div className="entry-head">
                      <div>
                        <div className="entry-title">{e.institution}</div>
                        <div className="entry-sub">
                          {e.degree} · {e.dates}
                        </div>
                      </div>
                      <RefChip ids={[e.evidenceId]} onClick={(ev) => openRefs(ev, [e.evidenceId], `${e.degree}, ${e.institution}`)} />
                    </div>
                  </div>
                ))}
              </Section>
            </div>

            <div className="preview-col">
              <div className="preview-head">
                <Segmented
                  label="Preview mode"
                  value={mode}
                  onChange={setMode}
                  options={[
                    { value: 'preview', label: <><Eye size={14} /> Preview</> },
                    { value: 'latex', label: <><Code2 size={14} /> LaTeX</> },
                  ]}
                />
                <span className={`page-indicator ${pages > 1 ? 'warn' : ''}`}>
                  {pages > 1 && <AlertTriangle size={13} aria-hidden />}
                  {pages === 1 ? '1 page' : `${pages} pages`}
                </span>
              </div>

              {latexReady && mode === 'latex' && (
                <Callout tone="success" title="LaTeX generated">
                  Copy or download the source, then evaluate it against the job.
                </Callout>
              )}

              {mode === 'preview' ? (
                <ResumePreview resume={resume} template={state.template} onPages={setPages} />
              ) : (
                <div className="latex">
                  <div className="latex-bar">
                    <span className="mono small">resume.tex</span>
                    <span className="latex-actions">
                      <Button size="sm" variant="ghost" icon={copied ? <Check size={13} /> : <Copy size={13} />} onClick={copyLatex}>
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Download size={13} />} onClick={downloadLatex}>
                        Download .tex
                      </Button>
                    </span>
                  </div>
                  <pre>
                    <code>{latex}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {popover && <EvidencePopover target={popover} onClose={() => setPopover(null)} />}
    </div>
  )
}

function Section({ title, count, open, onToggle, action, children }: { title: string; count?: number; open: boolean; onToggle: () => void; action?: ReactNode; children: ReactNode }) {
  return (
    <section className={`editor-section ${open ? 'open' : ''}`}>
      <div className="editor-section-head">
        <button className="section-toggle" aria-expanded={open} onClick={onToggle}>
          <ChevronDown size={16} className={open ? '' : 'rot-90n'} />
          <span>{title}</span>
          {count !== undefined && <span className="count">{count}</span>}
        </button>
        {open && action}
      </div>
      {open && <div className="editor-section-body">{children}</div>}
    </section>
  )
}

function RefChip({ ids, onClick }: { ids: string[]; onClick: (ev: React.MouseEvent<HTMLButtonElement>) => void }) {
  const estimate = ids.some((id) => evidenceById(id)?.status === 'user_reported_estimate')
  return (
    <button className={`ref-chip ${estimate ? 'estimate' : ''}`} onClick={onClick} aria-label={`View ${ids.length} supporting evidence${estimate ? ', includes a user estimate' : ''}`} title={ids.join(', ')}>
      <Link2 size={12} aria-hidden />
      {ids.length}
    </button>
  )
}

function useAutosize(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return ref
}

function BulletEditor({
  bullet,
  block,
  busy,
  onChange,
  onRestore,
  onRegenerate,
  onRemove,
  onRefs,
}: {
  bullet: Bullet
  block?: boolean
  busy?: boolean
  onChange: (text: string) => void
  onRestore: () => void
  onRegenerate?: () => void
  onRemove?: () => void
  onRefs: (ev: React.MouseEvent<HTMLButtonElement>, ids: string[], generated: string) => void
}) {
  const ref = useAutosize(bullet.text)
  const edited = bullet.text !== bullet.original

  return (
    <div className={`bullet ${block ? 'block' : ''} ${busy ? 'busy' : ''}`}>
      {!block && <span className="bullet-dot" aria-hidden />}
      <div className="bullet-main">
        {busy ? (
          <div className="bullet-loading" aria-live="polite">
            <Skeleton height={11} />
            <Skeleton width="80%" height={11} />
            <span className="sr-only">Regenerating</span>
          </div>
        ) : (
          <textarea ref={ref} className="bullet-input" value={bullet.text} rows={1} onChange={(e) => onChange(e.target.value)} aria-label="Resume text" />
        )}
        <div className="bullet-meta">
          <RefChip ids={bullet.evidenceIds} onClick={(ev) => onRefs(ev, bullet.evidenceIds, bullet.text)} />
          {edited && <Tag tone="accent">Edited</Tag>}
          <span className="bullet-actions">
            {onRegenerate && (
              <IconButton label="Regenerate wording" onClick={onRegenerate} disabled={busy}>
                <RefreshCw size={13} />
              </IconButton>
            )}
            <IconButton label="Restore original wording" onClick={onRestore} disabled={!edited || busy}>
              <RotateCcw size={13} />
            </IconButton>
            {onRemove && (
              <IconButton label="Remove bullet" className="danger" onClick={onRemove} disabled={busy}>
                <Trash2 size={13} />
              </IconButton>
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

function GeneratingSkeleton() {
  return (
    <div className="editor-grid" aria-busy="true" aria-live="polite">
      <div className="editor-col">
        <div className="generating-banner">
          <RefreshCw size={15} className="spin" aria-hidden />
          <div>
            <strong>Writing your tailored draft</strong>
            <span className="muted">Phrasing each claim from your selected evidence only.</span>
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="editor-section open">
            <div className="editor-section-head">
              <Skeleton width={140} height={13} />
            </div>
            <div className="editor-section-body">
              <Skeleton height={11} />
              <Skeleton width="92%" height={11} />
              <Skeleton width="76%" height={11} />
            </div>
          </div>
        ))}
      </div>
      <div className="preview-col">
        <div className="paper-skeleton">
          <Skeleton width="40%" height={16} className="center-block" />
          <Skeleton width="60%" height={9} className="center-block" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="paper-skeleton-section">
              <Skeleton width="30%" height={10} />
              <Skeleton height={8} />
              <Skeleton width="88%" height={8} />
              <Skeleton width="70%" height={8} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
