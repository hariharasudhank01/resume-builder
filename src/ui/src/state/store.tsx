import { createContext, useContext, useEffect, useReducer, useRef, useState, type ReactNode } from 'react'
import { DEFAULT_SELECTED } from '../data/mock'
import type { JobInput, Resume, SessionResponse, TemplateKey } from '../types'

export type View = 'build' | 'knowledge' | 'history'
export type Stage = 0 | 1 | 2 | 3
export type SaveStatus = 'saved' | 'saving' | 'unsaved'

export const STAGES = ['Job Description', 'Evidence', 'Resume', 'Evaluation'] as const

export interface AppState {
  view: View
  stage: Stage
  /** Furthest stage the user has reached; stages up to this one are navigable. */
  unlocked: Stage
  job: JobInput
  /** Created by the backend when the job description is analysed. Null until then. */
  session: SessionResponse | null
  selectedIds: string[]
  resume: Resume | null
  /** Selection the current draft was generated from, to detect stale drafts. */
  draftSelection: string[]
  past: Resume[]
  future: Resume[]
  lastEditKey: string | null
  lastEditAt: number
  template: TemplateKey
  resumeVersion: number
  evaluatedVersion: number | null
}

type Action =
  | { type: 'view'; view: View }
  | { type: 'stage'; stage: Stage }
  | { type: 'job'; patch: Partial<JobInput> }
  | { type: 'sessionCreated'; session: SessionResponse }
  | { type: 'toggleEvidence'; id: string }
  | { type: 'setSelected'; ids: string[] }
  | { type: 'clearDraft' }
  | { type: 'draftReady'; resume: Resume }
  | { type: 'edit'; key: string; update: (r: Resume) => Resume }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'template'; template: TemplateKey }
  | { type: 'evaluated' }
  | { type: 'reset' }

const STORAGE_KEY = 'resumebuilder.prototype.v1'
const COALESCE_MS = 1000

const initialState: AppState = {
  view: 'build',
  stage: 0,
  unlocked: 0,
  job: { title: '', company: '', description: '' },
  session: null,
  selectedIds: DEFAULT_SELECTED,
  resume: null,
  draftSelection: [],
  past: [],
  future: [],
  lastEditKey: null,
  lastEditAt: 0,
  template: 'classic',
  resumeVersion: 0,
  evaluatedVersion: null,
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'view':
      return { ...state, view: action.view }
    case 'stage':
      return {
        ...state,
        view: 'build',
        stage: action.stage,
        unlocked: Math.max(state.unlocked, action.stage) as Stage,
      }
    case 'job': {
      const changedDescription = action.patch.description !== undefined && action.patch.description !== state.job.description
      // A new description makes the existing session's requirements stale.
      return { ...state, job: { ...state.job, ...action.patch }, session: changedDescription ? null : state.session }
    }
    case 'sessionCreated':
      return { ...state, session: action.session }
    case 'toggleEvidence': {
      const selected = state.selectedIds.includes(action.id)
      return {
        ...state,
        selectedIds: selected ? state.selectedIds.filter((id) => id !== action.id) : [...state.selectedIds, action.id],
      }
    }
    case 'setSelected':
      return { ...state, selectedIds: action.ids }
    case 'clearDraft':
      return { ...state, resume: null, past: [], future: [], evaluatedVersion: null }
    case 'draftReady':
      return {
        ...state,
        resume: action.resume,
        draftSelection: [...state.selectedIds],
        past: [],
        future: [],
        lastEditKey: null,
        resumeVersion: state.resumeVersion + 1,
      }
    case 'edit': {
      if (!state.resume) return state
      const now = Date.now()
      const coalesce = action.key === state.lastEditKey && now - state.lastEditAt < COALESCE_MS
      return {
        ...state,
        resume: action.update(state.resume),
        past: coalesce ? state.past : [...state.past.slice(-49), state.resume],
        future: [],
        lastEditKey: action.key,
        lastEditAt: now,
        resumeVersion: state.resumeVersion + 1,
      }
    }
    case 'undo': {
      if (!state.resume || state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        ...state,
        resume: previous,
        past: state.past.slice(0, -1),
        future: [state.resume, ...state.future],
        lastEditKey: null,
        resumeVersion: state.resumeVersion + 1,
      }
    }
    case 'redo': {
      if (!state.resume || state.future.length === 0) return state
      const [next, ...rest] = state.future
      return {
        ...state,
        resume: next,
        past: [...state.past, state.resume],
        future: rest,
        lastEditKey: null,
        resumeVersion: state.resumeVersion + 1,
      }
    }
    case 'template':
      return { ...state, template: action.template }
    case 'evaluated':
      return { ...state, evaluatedVersion: state.resumeVersion }
    case 'reset':
      return initialState
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const saved = JSON.parse(raw) as Partial<AppState>
    return { ...initialState, ...saved, past: [], future: [], lastEditKey: null }
  } catch {
    return initialState
  }
}

function persist(state: AppState) {
  try {
    const { past: _p, future: _f, ...rest } = state
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
  } catch {
    // Storage unavailable (private window, blocked site data). The prototype still works in memory.
  }
}

interface StoreValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  saveStatus: SaveStatus
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const first = useRef(true)

  // Simulated autosave: unsaved → saving → saved.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setSaveStatus('unsaved')
    const toSaving = window.setTimeout(() => setSaveStatus('saving'), 900)
    const toSaved = window.setTimeout(() => {
      persist(state)
      setSaveStatus('saved')
    }, 1500)
    return () => {
      window.clearTimeout(toSaving)
      window.clearTimeout(toSaved)
    }
  }, [state.job, state.selectedIds, state.resume, state.template, state.stage, state.session, state.evaluatedVersion])

  return <StoreContext.Provider value={{ state, dispatch, saveStatus }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore must be used inside StoreProvider')
  return value
}
