// Shapes mirror what the FastAPI backend is expected to return.

export type SourceKey = 'about_me' | 'education' | 'work_experience' | 'projects' | 'skills' | 'general'

/** Status as recorded in the knowledge base. The user's confirmation is not independent verification. */
export type EvidenceStatus = 'confirmed_by_user' | 'user_reported_estimate' | 'needs_confirmation'

export interface Evidence {
  id: string
  title: string
  source: SourceKey
  file: string
  section: string
  text: string
  context?: string
  /** Retrieval similarity rescaled to 0–100. Not a probability. */
  relevance: number
  why: string
  requirements: string[]
  status: EvidenceStatus
}

export interface RequirementGroup {
  key: 'required' | 'preferred' | 'responsibilities'
  label: string
  items: string[]
}

export interface MissingEvidence {
  requirement: string
  message: string
}

export interface JobInput {
  title: string
  company: string
  description: string
}

export interface Bullet {
  id: string
  text: string
  original: string
  evidenceIds: string[]
  alternatives: string[]
}

export interface Entry {
  id: string
  heading: string
  subheading: string
  location?: string
  dates: string
  bullets: Bullet[]
}

export interface SkillRow {
  id: string
  label: string
  items: string
  evidenceIds: string[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  location: string
  dates: string
  evidenceId: string
}

export interface Resume {
  name: string
  contact: string[]
  summary: Bullet
  skills: SkillRow[]
  experience: Entry[]
  projects: Entry[]
  education: EducationItem[]
  certifications: string[]
}

export type TemplateKey = 'classic' | 'compact' | 'modern'

export type ScoreLevel = 'strong' | 'moderate' | 'weak'

export interface CategoryScore {
  key: string
  label: string
  score: number
  summary: string
  strengths: string[]
  gaps: string[]
  suggestion: string
}

export type Coverage = 'strong' | 'partial' | 'missing'

export interface CoverageRow {
  requirement: string
  coverage: Coverage
  evidence: string
  evidenceIds: string[]
  action: string
}

export interface Recommendation {
  title: string
  why: string
  priority: 'high' | 'medium' | 'low'
}

export interface Evaluation {
  overall: number
  summary: string
  categories: CategoryScore[]
  coverage: CoverageRow[]
  recommendations: Recommendation[]
}

export interface SessionResponse {
  id: string
  job: JobInput
  requirements: RequirementGroup[]
  created_at: string
}