import { useLayoutEffect, useRef, useState } from 'react'
import type { Entry, Resume, TemplateKey } from '../types'

const PAGE_W = 794 // A4 at 96 dpi
const PAGE_H = 1123

function Entries({ items }: { items: Entry[] }) {
  return (
    <>
      {items.map((e) => (
        <div key={e.id} className="r-entry">
          <div className="r-entry-head">
            <strong>{e.heading}</strong>
            <span>{e.dates}</span>
          </div>
          <div className="r-entry-sub">
            <em>{e.subheading}</em>
            {e.location && <span>{e.location}</span>}
          </div>
          <ul>
            {e.bullets.map((b) => (
              <li key={b.id}>{b.text}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

export function ResumePreview({ resume, template, onPages }: { resume: Resume; template: TemplateKey; onPages?: (n: number) => void }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.6)
  const [pages, setPages] = useState(1)

  useLayoutEffect(() => {
    const measure = () => {
      if (!outer.current || !inner.current) return
      setScale(outer.current.clientWidth / PAGE_W)
      const n = Math.max(1, Math.ceil(inner.current.scrollHeight / PAGE_H))
      setPages(n)
      onPages?.(n)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (outer.current) ro.observe(outer.current)
    if (inner.current) ro.observe(inner.current)
    return () => ro.disconnect()
  }, [resume, template, onPages])

  return (
    <div ref={outer} className="paper-frame" style={{ height: pages * PAGE_H * scale }}>
      <div className="paper-scale" style={{ transform: `scale(${scale})`, width: PAGE_W }}>
        {Array.from({ length: pages }, (_, i) => (
          <div key={i} className={`paper-sheet ${i > 0 ? 'page-break' : ''}`} style={{ top: i * PAGE_H, height: PAGE_H }} aria-hidden />
        ))}
        <div ref={inner} className={`resume resume-${template}`}>
          <header className="r-head">
            <h2>{resume.name}</h2>
            <p>{resume.contact.join('  ·  ')}</p>
          </header>

          <section>
            <h3>Professional Summary</h3>
            <p>{resume.summary.text}</p>
          </section>

          <section>
            <h3>Technical Skills</h3>
            <dl className="r-skills">
              {resume.skills.map((s) => (
                <div key={s.id}>
                  <dt>{s.label}:</dt> <dd>{s.items}</dd>
                </div>
              ))}
            </dl>
          </section>

          {resume.experience.length > 0 && (
            <section>
              <h3>Work Experience</h3>
              <Entries items={resume.experience} />
            </section>
          )}

          {resume.projects.length > 0 && (
            <section>
              <h3>Projects</h3>
              <Entries items={resume.projects} />
            </section>
          )}

          <section>
            <h3>Education</h3>
            {resume.education.map((e) => (
              <div key={e.id} className="r-entry">
                <div className="r-entry-head">
                  <strong>{e.institution}</strong>
                  <span>{e.dates}</span>
                </div>
                <div className="r-entry-sub">
                  <em>{e.degree}</em>
                  <span>{e.location}</span>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3>Certifications</h3>
            <p>{resume.certifications.join('  ·  ')}</p>
          </section>
        </div>
      </div>
    </div>
  )
}
