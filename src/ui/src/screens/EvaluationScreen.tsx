import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, CheckCircle2, ClipboardCopy, Download, FileQuestion, Info, PenLine, RefreshCw, Search, XCircle } from 'lucide-react'
import { EVALUATION, PARTIAL_CATEGORIES } from '../data/mock'
import { toLatex } from '../lib/latex'
import { useStore } from '../state/store'
import type { CategoryScore } from '../types'
import { Button, Callout, CoverageBadge, EmptyState, LevelBadge, PageHeader, ProgressBar, Skeleton, StatePicker, Tag, scoreLevel } from '../components/ui'

type DemoState = 'live' | 'running' | 'missing' | 'partial' | 'stale'

const RUN_STEPS = ['Reading resume text', 'Matching job requirements', 'Scoring five categories', 'Writing recommendations']

export function EvaluationScreen() {
  const { state, dispatch } = useStore()
  const [running, setRunning] = useState(state.evaluatedVersion === null && !!state.resume)
  const [step, setStep] = useState(0)
  const [demo, setDemo] = useState<DemoState>('live')
  const [copied, setCopied] = useState(false)
  const timers = useRef<number[]>([])

  const run = () => {
    setRunning(true)
    setStep(0)
    timers.current.forEach(window.clearTimeout)
    timers.current = [
      ...RUN_STEPS.map((_, i) => window.setTimeout(() => setStep(i + 1), 450 * (i + 1))),
      window.setTimeout(() => {
        setRunning(false)
        dispatch({ type: 'evaluated' })
      }, 450 * RUN_STEPS.length + 300),
    ]
  }

  useEffect(() => {
    if (running) run()
    return () => timers.current.forEach(window.clearTimeout)
    // Run once on mount when there is no evaluation yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isRunning = running || demo === 'running'
  const missing = !state.resume || demo === 'missing'
  const partial = demo === 'partial'
  const stale = demo === 'stale' || (!isRunning && state.evaluatedVersion !== null && state.evaluatedVersion !== state.resumeVersion)

  const forceDemo = (d: DemoState) => {
    setDemo(d)
    if (d === 'live' && state.evaluatedVersion !== state.resumeVersion && state.resume) dispatch({ type: 'evaluated' })
  }

  const ev = EVALUATION
  const categories = partial ? ev.categories.filter((c) => PARTIAL_CATEGORIES.includes(c.key)) : ev.categories
  const overall = partial ? Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length) : ev.overall
  const target = [state.job.title || 'Untitled role', state.job.company].filter(Boolean).join(' at ')

  const exportResume = () => {
    if (!state.resume) return
    const url = URL.createObjectURL(new Blob([toLatex(state.resume, state.template)], { type: 'application/x-tex' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'hariharasudhan-k-resume-final.tex'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyReport = async () => {
    const lines = [
      `Resume match report: ${target}`,
      `Overall: ${overall}/100 (heuristic, not an ATS score)`,
      '',
      ...categories.map((c) => `${c.label}: ${c.score}/100. ${c.summary}`),
      '',
      'Requirement coverage:',
      ...ev.coverage.map((r) => `- ${r.requirement}: ${r.coverage}. ${r.action}`),
      '',
      'Recommended improvements:',
      ...ev.recommendations.map((r, i) => `${i + 1}. ${r.title}. ${r.why}`),
    ]
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="screen">
      <PageHeader
        title="Your resume match report"
        meta={
          <>
            <span className="meta-item">
              <strong>{target}</strong>
            </span>
            <span className="meta-sep" aria-hidden />
            <span className="meta-item mono">resume.tex · draft v{state.resumeVersion}</span>
          </>
        }
        actions={
          <StatePicker
            value={isRunning ? 'running' : missing ? 'missing' : partial ? 'partial' : stale ? 'stale' : 'live'}
            onChange={forceDemo}
            options={[
              { value: 'live', label: 'Evaluation complete' },
              { value: 'running', label: 'Evaluation running' },
              { value: 'missing', label: 'Missing resume text' },
              { value: 'partial', label: 'Partial evaluation' },
              { value: 'stale', label: 'Needs re-evaluation' },
            ]}
          />
        }
      />

      <div className="heuristic-note">
        <Info size={14} aria-hidden />
        These scores are heuristic assessments of how well your resume's evidence matches this job description. They are not official ATS scores and do not predict hiring
        success.
      </div>

      {missing ? (
        <div className="panel">
          <EmptyState
            icon={<FileQuestion size={20} />}
            title="No resume text to evaluate"
            action={
              <Button variant="primary" icon={<PenLine size={15} />} onClick={() => dispatch({ type: 'stage', stage: 2 })}>
                Go to resume editor
              </Button>
            }
          >
            We couldn't find generated resume text or an exported PDF for this job. Generate a draft in the editor, then come back to evaluate it.
          </EmptyState>
        </div>
      ) : isRunning ? (
        <RunningState step={step} />
      ) : (
        <>
          {stale && (
            <Callout
              tone="warning"
              title="Your resume changed since this evaluation"
              action={
                <Button variant="primary" icon={<RefreshCw size={15} />} onClick={() => { setDemo('live'); run() }}>
                  Re-run evaluation
                </Button>
              }
            >
              The scores below reflect an earlier draft. Re-run the evaluation to see how your edits affect the match.
            </Callout>
          )}
          {partial && (
            <Callout tone="warning" title="Partial evaluation">
              Two categories could not be scored because the job requirements section was too short to compare reliably. The overall score uses the three categories
              that completed.
            </Callout>
          )}

          <div className={`eval-overview panel ${stale ? 'dimmed' : ''}`}>
            <ScoreRing score={overall} />
            <div className="eval-overview-text">
              <div className="eval-overview-head">
                <h2>Overall match</h2>
                <LevelBadge score={overall} />
                {partial && <Tag tone="warning">Based on 3 of 5 categories</Tag>}
              </div>
              <p>{ev.summary}</p>
              <div className="sw">
                <div>
                  <div className="sw-label">Main strengths</div>
                  <ul className="check-list">
                    <li><CheckCircle2 size={14} aria-hidden /> Python, SQL and ETL all backed by work and project evidence</li>
                    <li><CheckCircle2 size={14} aria-hidden /> Data quality shown through automated tests and validation</li>
                  </ul>
                </div>
                <div>
                  <div className="sw-label">Main gaps</div>
                  <ul className="check-list gaps">
                    <li><XCircle size={14} aria-hidden /> No workflow orchestration (Airflow) evidence</li>
                    <li><XCircle size={14} aria-hidden /> Cloud experience limited to a foundational certification</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <h2 className="section-title">Category scores</h2>
          <div className={`cat-grid ${stale ? 'dimmed' : ''}`}>
            {ev.categories.map((c) =>
              categories.includes(c) ? (
                <CategoryCard key={c.key} c={c} />
              ) : (
                <div key={c.key} className="cat-card unavailable">
                  <div className="cat-head">
                    <span className="cat-title">{c.label}</span>
                    <Tag tone="muted">Not scored</Tag>
                  </div>
                  <p className="muted small">This category could not be evaluated. Re-run the evaluation once the job description is complete.</p>
                </div>
              ),
            )}
          </div>

          <h2 className="section-title">Job requirement coverage</h2>
          <div className={`panel table-panel ${stale ? 'dimmed' : ''}`}>
            <table className="coverage">
              <thead>
                <tr>
                  <th>Requirement</th>
                  <th>Coverage</th>
                  <th>Supporting resume evidence</th>
                  <th>Suggested next action</th>
                </tr>
              </thead>
              <tbody>
                {ev.coverage.map((r) => (
                  <tr key={r.requirement} className={`row-${r.coverage}`}>
                    <td className="req-cell">{r.requirement}</td>
                    <td>
                      <CoverageBadge coverage={r.coverage} />
                    </td>
                    <td>
                      <span className={r.coverage === 'missing' ? 'muted' : ''}>{r.evidence}</span>
                      {r.evidenceIds.length > 0 && (
                        <span className="id-list">
                          {r.evidenceIds.map((id) => (
                            <span key={id} className="mono id-chip">
                              {id}
                            </span>
                          ))}
                        </span>
                      )}
                    </td>
                    <td className="action-cell">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="section-title">Recommended improvements</h2>
          <ol className={`recs ${stale ? 'dimmed' : ''}`}>
            {ev.recommendations.map((r, i) => (
              <li key={r.title} className="rec">
                <span className="rec-num">{i + 1}</span>
                <div>
                  <div className="rec-head">
                    <strong>{r.title}</strong>
                    <Tag tone={r.priority === 'high' ? 'accent' : 'muted'}>{r.priority[0].toUpperCase() + r.priority.slice(1)} priority</Tag>
                  </div>
                  <p>{r.why}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="muted small honesty">Suggestions never ask you to add a skill or achievement you can't substantiate. If something is missing, record real evidence in your knowledge base first.</p>

          <div className="final-actions">
            <div className="toolbar-group">
              <Button icon={<PenLine size={15} />} onClick={() => dispatch({ type: 'stage', stage: 2 })}>
                Edit resume
              </Button>
              <Button icon={<Search size={15} />} onClick={() => dispatch({ type: 'stage', stage: 1 })}>
                Review evidence
              </Button>
              <Button variant="ghost" icon={copied ? <Check size={15} /> : <ClipboardCopy size={15} />} onClick={copyReport}>
                {copied ? 'Copied' : 'Copy evaluation report'}
              </Button>
            </div>
            <Button variant="primary" size="lg" icon={<Download size={16} />} onClick={exportResume}>
              Export final resume
            </Button>
          </div>
          <p className="muted small">
            <ArrowLeft size={12} aria-hidden /> Returning to the editor keeps all your changes.
          </p>
        </>
      )}
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <div className={`ring ring-${scoreLevel(score)}`} role="img" aria-label={`Overall match ${score} out of 100`}>
      <svg viewBox="0 0 120 120" width="132" height="132" aria-hidden>
        <circle cx="60" cy="60" r={r} className="ring-track" />
        <circle cx="60" cy="60" r={r} className="ring-value" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 60 60)" />
      </svg>
      <div className="ring-label">
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  )
}

function CategoryCard({ c }: { c: CategoryScore }) {
  return (
    <div className="cat-card">
      <div className="cat-head">
        <span className="cat-title">{c.label}</span>
        <LevelBadge score={c.score} />
      </div>
      <div className="cat-score">
        <strong>{c.score}</strong>
        <span className="muted">/100</span>
      </div>
      <ProgressBar value={c.score} level={scoreLevel(c.score)} />
      <p className="cat-summary">{c.summary}</p>
      <div className="cat-lists">
        <div>
          <div className="sw-label">Strengths</div>
          <ul className="check-list">
            {c.strengths.map((s) => (
              <li key={s}>
                <CheckCircle2 size={13} aria-hidden /> {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="sw-label">Missing or weak</div>
          <ul className="check-list gaps">
            {c.gaps.map((s) => (
              <li key={s}>
                <XCircle size={13} aria-hidden /> {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="cat-suggestion">
        <span className="sw-label">Suggestion</span>
        {c.suggestion}
      </div>
    </div>
  )
}

function RunningState({ step }: { step: number }) {
  return (
    <div className="eval-running">
      <div className="panel running-panel" aria-live="polite">
        <div className="running-title">
          <RefreshCw size={16} className="spin" aria-hidden />
          <strong>Evaluating your resume against the job description</strong>
        </div>
        <ul className="steps-list">
          {RUN_STEPS.map((s, i) => (
            <li key={s} className={i < step ? 'done' : i === step ? 'active' : ''}>
              <span className="steps-dot">{i < step ? <Check size={11} strokeWidth={3} /> : null}</span>
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="cat-grid">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="cat-card">
            <Skeleton width="50%" height={12} />
            <Skeleton width={60} height={26} />
            <Skeleton height={6} />
            <Skeleton height={10} />
            <Skeleton width="80%" height={10} />
          </div>
        ))}
      </div>
    </div>
  )
}
