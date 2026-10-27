import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, FileText, Lock, ScanSearch, Sparkles, X } from 'lucide-react'
import { REQUIREMENTS, SAMPLE_JOB } from '../data/mock'
import { createSession } from '../lib/api'
import { useStore } from '../state/store'
import { Button, Callout, PageHeader, Skeleton, StatePicker, Tag } from '../components/ui'

type JdState = 'empty' | 'entered' | 'loading' | 'success' | 'error'

const MIN_WORDS = 40
const ANALYSIS_STEPS = ['Reading the job description', 'Extracting skills and responsibilities', 'Grouping requirements']

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0)

export function JobDescriptionScreen() {
  const { state, dispatch } = useStore()
  const { job, session } = state
  const analysed = session !== null
  const requirementCount = session ? session.requirements.reduce((n, g) => n + g.items.length, 0) : 0
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  const words = countWords(job.description)
  const current: JdState = loading ? 'loading' : error ? 'error' : analysed ? 'success' : job.description ? 'entered' : 'empty'

  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])

  const analyse = async (input = job) => {
    if (countWords(input.description) < MIN_WORDS) {
      setError(`Add the full job description. At least ${MIN_WORDS} words are needed to extract requirements reliably.`)
      return
    }
    setError(null)
    setLoading(true)
    setStep(0)
    // The backend reports no progress, so the steps advance on a timer and the last one waits for the response.
    timers.current.forEach(window.clearTimeout)
    timers.current = [window.setTimeout(() => setStep(1), 600), window.setTimeout(() => setStep(2), 1200)]
    try {
      const created = await createSession(input)
      dispatch({ type: 'sessionCreated', session: created })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      timers.current.forEach(window.clearTimeout)
      setLoading(false)
    }
  }

  const forceState = (s: JdState) => {
    timers.current.forEach(window.clearTimeout)
    setLoading(false)
    setError(null)
    if (s === 'empty') dispatch({ type: 'job', patch: { title: '', company: '', description: '' } })
    else if (s === 'error') {
      dispatch({ type: 'job', patch: { title: 'Graduate Data Engineer', company: '', description: 'Graduate Data Engineer. Python, SQL, ETL.' } })
      setError(`Add the full job description. At least ${MIN_WORDS} words are needed to extract requirements reliably.`)
    } else {
      dispatch({ type: 'job', patch: SAMPLE_JOB })
      if (s === 'loading') analyse(SAMPLE_JOB)
      // Preview only: shows the mock requirements without calling the backend.
      if (s === 'success')
        dispatch({ type: 'sessionCreated', session: { id: 'preview', job: SAMPLE_JOB, requirements: REQUIREMENTS, created_at: new Date().toISOString() } })
    }
  }

  return (
    <div className="screen">
      <PageHeader
        title="Build your next resume"
        subtitle="Turn your experience into a resume tailored to the role."
        actions={
          <StatePicker
            value={current}
            onChange={forceState}
            options={[
              { value: 'empty', label: 'Empty' },
              { value: 'entered', label: 'Description entered' },
              { value: 'loading', label: 'Analysing' },
              { value: 'success', label: 'Analysis complete' },
              { value: 'error', label: 'Validation error' },
            ]}
          />
        }
      />

      <div className="jd-grid">
        <section className="panel jd-input" aria-labelledby="jd-label">
          <div className="field-row">
            <label className="field">
              <span className="field-label">
                Job title <span className="optional">Optional</span>
              </span>
              <input className="input" value={job.title} placeholder="e.g. Graduate Data Engineer" onChange={(e) => dispatch({ type: 'job', patch: { title: e.target.value } })} />
            </label>
            <label className="field">
              <span className="field-label">
                Company <span className="optional">Optional</span>
              </span>
              <input className="input" value={job.company} placeholder="e.g. Harbourline Analytics" onChange={(e) => dispatch({ type: 'job', patch: { company: e.target.value } })} />
            </label>
          </div>

          <div className="field">
            <div className="field-label-row">
              <label id="jd-label" htmlFor="jd" className="field-label">
                Job Description
              </label>
              {!job.description && (
                <button className="link-btn" onClick={() => dispatch({ type: 'job', patch: SAMPLE_JOB })}>
                  Use a sample job description
                </button>
              )}
            </div>
            <div className={`textarea-wrap ${error ? 'has-error' : ''}`}>
              <textarea
                id="jd"
                className="textarea jd-textarea"
                placeholder="Paste the full job description here..."
                value={job.description}
                aria-invalid={!!error}
                aria-describedby={error ? 'jd-error' : 'jd-count'}
                disabled={loading}
                onChange={(e) => {
                  setError(null)
                  dispatch({ type: 'job', patch: { description: e.target.value } })
                }}
              />
              <div className="textarea-foot">
                <span id="jd-count" className="muted">
                  {words.toLocaleString()} words · {job.description.length.toLocaleString()} characters
                </span>
                {job.description && !loading && (
                  <button
                    className="link-btn subtle"
                    onClick={() => {
                      setError(null)
                      dispatch({ type: 'job', patch: { description: '' } })
                    }}
                  >
                    <X size={13} /> Clear
                  </button>
                )}
              </div>
            </div>
            {error && (
              <p id="jd-error" className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="jd-actions">
            <Button variant="primary" size="lg" icon={<ScanSearch size={16} />} loading={loading} onClick={() => analyse()} disabled={!job.description.trim()}>
              {loading ? 'Analysing…' : analysed ? 'Re-analyse job description' : 'Analyse job description'}
            </Button>
          </div>

          <div className="note">
            <Lock size={14} aria-hidden />
            <p>
              ResumeBuilder extracts the requirements from this job description and matches them against your existing knowledge base. Nothing is added to your resume
              unless it is backed by evidence you have recorded, and you choose what to include.
            </p>
          </div>
        </section>

        <aside className="panel jd-preview" aria-labelledby="req-heading">
          <div className="panel-head">
            <h2 id="req-heading">Job requirements</h2>
            {analysed && !loading && <Tag tone="muted">Awaiting evidence match</Tag>}
          </div>

          {current === 'loading' && (
            <div className="analysis-progress" aria-live="polite">
              <ul className="steps-list">
                {ANALYSIS_STEPS.map((s, i) => (
                  <li key={s} className={i < step ? 'done' : i === step ? 'active' : ''}>
                    <span className="steps-dot">{i < step ? <Check size={11} strokeWidth={3} /> : null}</span>
                    {s}
                  </li>
                ))}
              </ul>
              {[0, 1, 2].map((g) => (
                <div key={g} className="req-group">
                  <Skeleton width={110} height={10} />
                  <div className="tag-row">
                    <Skeleton width={64} height={24} />
                    <Skeleton width={48} height={24} />
                    <Skeleton width={88} height={24} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {current !== 'loading' && !analysed && (
            <div className="jd-preview-empty">
              <div className="empty-icon" aria-hidden>
                <FileText size={18} />
              </div>
              <p>Once you analyse a job description, the required skills, preferred skills and responsibilities it mentions will appear here for you to review.</p>
              <ul className="ghost-groups" aria-hidden>
                <li>Required skills</li>
                <li>Preferred skills</li>
                <li>Responsibilities</li>
              </ul>
            </div>
          )}

          {current !== 'loading' && session && (
            <>
              <p className="muted small">Extracted from the job description. These have not been matched against your knowledge base yet.</p>
              {session.requirements.map((g) => (
                <div key={g.key} className="req-group">
                  <div className="req-label">
                    {g.label} <span className="muted">{g.items.length}</span>
                  </div>
                  <div className="tag-row">
                    {g.items.map((item) => (
                      <Tag key={item} tone={g.key === 'required' ? 'accent' : 'neutral'}>
                        {item}
                      </Tag>
                    ))}
                  </div>
                </div>
              ))}
              <Callout tone="info">Found {requirementCount} requirements. Next, ResumeBuilder searches your 6 knowledge files for evidence that supports each one.</Callout>
              <Button variant="primary" className="full" iconRight={<ArrowRight size={16} />} icon={<Sparkles size={15} />} onClick={() => dispatch({ type: 'stage', stage: 1 })}>
                Continue to evidence matching
              </Button>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
