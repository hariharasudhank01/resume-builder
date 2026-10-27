# ResumeBuilder UI prototype

Clickable prototype of the resume builder's four-stage workflow:
Job Description → Evidence → Resume → Evaluation. Job description analysis
calls the FastAPI backend in `src/api`; the other stages still use mock data.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

The backend URL comes from `VITE_API_BASE_URL` in `.env.development`
(default `http://localhost:8000`). Start the API before analysing a job description.

## Structure

| Path | Purpose |
| --- | --- |
| `src/styles/tokens.css` | Design tokens: colour, type, spacing, radius, shadow |
| `src/styles/app.css` | Component and screen styles |
| `src/components/ui.tsx` | Primitives: buttons, tags, status/relevance/score badges, callouts, empty states, skeletons |
| `src/components/Shell.tsx` | Sidebar, workflow stepper, save indicator |
| `src/components/EvidenceCard.tsx` | Evidence card with selection, relevance and verification status |
| `src/components/EvidencePopover.tsx` | Traceability popover: generated wording vs. original evidence |
| `src/components/ResumePreview.tsx` | A4 resume preview with page counting and three templates |
| `src/screens/*` | The four workflow screens plus Knowledge Base and Resume History |
| `src/state/store.tsx` | App state (reducer), undo/redo and simulated autosave to `localStorage` |
| `src/data/mock.ts` | Mock evidence (paraphrased from `knowledge_base/`), resume bank and evaluation |
| `src/types.ts` | Data shapes the FastAPI backend should return |
| `src/lib/latex.ts` | Builds LaTeX source from the resume |

Each screen has a dashed **Prototype state** selector in its header. Use it to
switch between the designed states (loading, empty, error, partial and so on).
It is a review aid, not part of the product UI.

## Backend integration points

Analysing the job description is connected (`src/lib/api.ts` → `POST /api/sessions`).
Replace these mock calls with API calls:
- retrieving evidence (`EVIDENCE`, `MISSING_EVIDENCE`)
- generating the draft (`generateResume`)
- regenerating bullets (`alternatives`)
- evaluating the resume (`EVALUATION`)
