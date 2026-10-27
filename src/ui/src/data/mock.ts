// Mock data for the prototype. Evidence is paraphrased from knowledge_base/*.md;
// the job, company and scores are fictional and no backend or LLM is called.

import type {
  Bullet,
  Entry,
  Evaluation,
  Evidence,
  MissingEvidence,
  RequirementGroup,
  Resume,
  SourceKey,
} from '../types'

export const SAMPLE_JOB = {
  title: 'Graduate Data Engineer',
  company: 'Harbourline Analytics',
  description: `About the role
Harbourline Analytics is looking for a Graduate Data Engineer to join our platform team in Canberra. You will help build and maintain the pipelines that move data from operational systems into our analytics warehouse, and work closely with analysts to make that data trustworthy.

What you'll do
- Design, build and maintain batch ETL/ELT data pipelines
- Write clean, tested Python and SQL
- Model data in the warehouse for analytics and reporting
- Implement data quality checks and monitor pipeline health
- Contribute to our analytics infrastructure and CI/CD practices
- Explain data issues clearly to non-technical stakeholders

What we're looking for
- Strong Python and SQL skills
- Experience building ETL pipelines, through work or substantial projects
- Understanding of relational databases and dimensional modelling
- Familiarity with version control and CI/CD

Nice to have
- Experience with AWS (S3, Glue, Redshift or similar)
- dbt
- Apache Airflow or another workflow orchestrator
- Docker`,
}

export const REQUIREMENTS: RequirementGroup[] = [
  { key: 'required', label: 'Required skills', items: ['Python', 'SQL', 'ETL pipelines', 'Dimensional modelling', 'CI/CD'] },
  { key: 'preferred', label: 'Preferred skills', items: ['AWS', 'dbt', 'Airflow', 'Docker'] },
  {
    key: 'responsibilities',
    label: 'Responsibilities',
    items: ['Data pipelines', 'Data quality', 'Analytics infrastructure', 'Stakeholder communication'],
  },
]

export const SOURCES: { key: SourceKey | 'all'; label: string; file?: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'about_me', label: 'About Me', file: 'about_me.md' },
  { key: 'education', label: 'Education', file: 'education.md' },
  { key: 'work_experience', label: 'Work Experience', file: 'work_experience.md' },
  { key: 'projects', label: 'Projects', file: 'projects.md' },
  { key: 'skills', label: 'Skills', file: 'skills.md' },
  { key: 'general', label: 'General', file: 'general.md' },
]

export const EVIDENCE: Evidence[] = [
  {
    id: 'WEX-ERIC-04',
    title: 'Built an event-triggered release-report ETL pipeline',
    source: 'work_experience',
    file: 'work_experience.md',
    section: 'Ericsson · JIRA → Confluence automation',
    text: 'Designed and built an event-triggered ETL pipeline in Python: extracts sprint JIRA cards via the API, filters by version and release tag, enriches resolved cards, and loads a structured release report into Confluence.',
    context:
      "The product owner's idea; I designed and built it. Linked to each service's release pipeline YAML so every release runs it automatically. Previously the product owner prepared these documents by hand each sprint.",
    relevance: 91,
    why: 'Direct support for building ETL pipelines in Python, including extraction from an API and automated triggering.',
    requirements: ['ETL pipelines', 'Python', 'Data pipelines'],
    status: 'confirmed_by_user',
  },
  {
    id: 'PRJ-OLIST',
    title: 'Built an end-to-end analytics warehouse with dbt',
    source: 'projects',
    file: 'projects.md',
    section: 'E-Commerce Analytics · Pipeline and architecture',
    text: 'Loaded raw Olist CSVs into PostgreSQL with pandas and SQLAlchemy, then transformed them in a three-layer dbt project (preprocessing → marts → insights) feeding Tableau dashboards.',
    context:
      'Solo, self-directed project (Aug–Sep 2026). Marts: dim_customer, dim_product, dim_date, fact_order_item, fact_payments. The Python loader retries until the database container is ready.',
    relevance: 89,
    why: 'Shows warehouse modelling, dbt and a full load → transform → visualise pipeline.',
    requirements: ['ETL pipelines', 'dbt', 'Dimensional modelling', 'SQL'],
    status: 'confirmed_by_user',
  },
  {
    id: 'SKL-DBT',
    title: 'Wrote dbt schema tests for data quality',
    source: 'skills',
    file: 'skills.md',
    section: 'Data engineering · dbt Core',
    text: 'Schema tests on the Olist models: unique, not_null, relationships, accepted_values, and a composite-key test using dbt_utils.unique_combination_of_columns.',
    relevance: 86,
    why: 'Supports the data quality responsibility with concrete, automated tests.',
    requirements: ['Data quality', 'dbt'],
    status: 'confirmed_by_user',
  },
  {
    id: 'PRJ-OLIST-01',
    title: 'Diagnosed and fixed a grain mismatch',
    source: 'projects',
    file: 'projects.md',
    section: 'E-Commerce Analytics · Grain mismatch fix',
    text: 'Found row multiplication caused by joining two fact tables at different grains. Fixed it by aggregating before joining, and verified the result against manual totals.',
    relevance: 82,
    why: 'Evidence of dimensional modelling judgement and validating outputs, not just writing SQL.',
    requirements: ['Dimensional modelling', 'Data quality', 'SQL'],
    status: 'confirmed_by_user',
  },
  {
    id: 'SKL-SQL',
    title: 'Applied intermediate SQL in dbt models',
    source: 'skills',
    file: 'skills.md',
    section: 'Data engineering · SQL',
    text: 'CTEs, window functions (row_number for cohort assignment), aggregating before joining to avoid fan-out, role-playing joins, and data-validation filters.',
    context: 'Also studied in the ANU Relational Databases course. Recorded as a foundation that is still being strengthened.',
    relevance: 80,
    why: 'Supports the SQL requirement with specific techniques used in a real project.',
    requirements: ['SQL'],
    status: 'confirmed_by_user',
  },
  {
    id: 'WEX-ERIC-02',
    title: 'Owned pipeline triage as Build Master',
    source: 'work_experience',
    file: 'work_experience.md',
    section: 'Ericsson · Build Master',
    text: 'Monitored Jenkins pipelines across 12 internal and 8 downstream services, traced failures to the responsible push through version tags, reproduced them locally and coordinated workarounds and fixes.',
    context: 'Outcome recorded as "caught 90% of issues before release". This figure is your own estimate, not a formal measurement.',
    relevance: 74,
    why: 'Relevant to monitoring pipeline health and CI/CD, although these are build pipelines rather than data pipelines.',
    requirements: ['CI/CD', 'Data pipelines'],
    status: 'user_reported_estimate',
  },
  {
    id: 'WEX-INDG-01',
    title: 'Designed and built an AI evaluation system',
    source: 'work_experience',
    file: 'work_experience.md',
    section: 'Indigitise · AI Eval',
    text: 'Sole developer of an AI model evaluation framework with CLI, FastAPI and Streamlit entry points over shared code. Every run is stored in PostgreSQL with pgvector; containerised with Docker Compose.',
    relevance: 71,
    why: 'Shows Python engineering, PostgreSQL storage and Docker. Less directly about warehouse pipelines.',
    requirements: ['Python', 'Docker', 'Analytics infrastructure'],
    status: 'confirmed_by_user',
  },
  {
    id: 'WEX-ERIC-01',
    title: 'Containerised and deployed microservices',
    source: 'work_experience',
    file: 'work_experience.md',
    section: 'Ericsson · Containerisation and CI/CD',
    text: 'Containerised and deployed microservices with Docker, Kubernetes and Helm, and supported end-to-end CI/CD pipelines.',
    relevance: 68,
    why: 'Supports Docker and CI/CD familiarity.',
    requirements: ['Docker', 'CI/CD'],
    status: 'confirmed_by_user',
  },
  {
    id: 'WEX-ERIC-03',
    title: 'Restructured a service test suite after a production bug',
    source: 'work_experience',
    file: 'work_experience.md',
    section: 'Ericsson · Secret Manager (FAR)',
    text: 'Reproduced a production alarm bug with fake certificates, resolved it, then restructured the Secret Manager test suite, resolving most of its recurring pipeline failures.',
    context: 'The exact root cause and code fix are recorded as unknown (about two years ago).',
    relevance: 63,
    why: 'Shows testing discipline and reliability ownership, which transfers to monitoring pipeline health.',
    requirements: ['Data quality', 'CI/CD'],
    status: 'confirmed_by_user',
  },
  {
    id: 'EDU-CERT-AWS',
    title: 'AWS Certified Cloud Practitioner',
    source: 'education',
    file: 'education.md',
    section: 'Certifications',
    text: 'AWS Certified Cloud Practitioner, Amazon Web Services, July 2026 – July 2029.',
    context: 'Recorded as foundational knowledge only, with no hands-on AWS use yet.',
    relevance: 58,
    why: 'Partial support for the AWS preference: a certification, not hands-on experience.',
    requirements: ['AWS'],
    status: 'confirmed_by_user',
  },
  {
    id: 'PRJ-VOTER',
    title: 'Cleaned and profiled survey data',
    source: 'projects',
    file: 'projects.md',
    section: 'Indigenous Voting Behaviour · Data preparation',
    text: 'Profiled and handled special codes in survey data before modelling with decision trees, k-means and Apriori.',
    relevance: 55,
    why: 'Supports data cleaning experience in a different context (analysis rather than pipelines).',
    requirements: ['Data quality', 'Python'],
    status: 'confirmed_by_user',
  },
  {
    id: 'EDU-ANU',
    title: 'Master of Business Information Systems (ANU)',
    source: 'education',
    file: 'education.md',
    section: 'EDU-ANU',
    text: 'Master of Business Information Systems, The Australian National University, February 2025 – November 2026. Coursework includes Relational Databases and Data Mining.',
    relevance: 52,
    why: 'Relevant coursework for relational databases and analytics.',
    requirements: ['SQL'],
    status: 'confirmed_by_user',
  },
  {
    id: 'EDU-TCE',
    title: 'Bachelor of Engineering, Computer Science (TCE)',
    source: 'education',
    file: 'education.md',
    section: 'EDU-TCE',
    text: 'Bachelor of Engineering, Computer Science and Engineering, Thiagarajar College of Engineering, Tamil Nadu, 2018 – 2022. Coursework includes Database Management Systems and Data Science using Python.',
    relevance: 44,
    why: 'Foundational computing degree with database coursework.',
    requirements: ['SQL'],
    status: 'confirmed_by_user',
  },
  {
    id: 'ABT-006a',
    title: 'Explained release failures to stakeholders',
    source: 'about_me',
    file: 'about_me.md',
    section: 'Bridging technical and non-technical audiences',
    text: 'Explained pipeline failures to stakeholders without internal bug detail: the high-level cause, scope, expected time to fix, the team responsible, and the updated release date.',
    relevance: 49,
    why: 'Matches "explain data issues clearly to non-technical stakeholders".',
    requirements: ['Stakeholder communication'],
    status: 'confirmed_by_user',
  },
  {
    id: 'GEN-01',
    title: 'Presented a technical product at TechInGov 2026',
    source: 'general',
    file: 'general.md',
    section: 'GEN-01',
    text: "Explained Indigitise's 5G-enabled micro data centre to a mixed government, technical and non-technical audience, reworking the pitch on the spot.",
    relevance: 34,
    why: 'Weak match. Communication evidence, but not related to data engineering.',
    requirements: ['Stakeholder communication'],
    status: 'confirmed_by_user',
  },
]

export const MISSING_EVIDENCE: MissingEvidence[] = [
  {
    requirement: 'Airflow',
    message: 'No evidence in your knowledge base mentions Airflow or another workflow orchestrator. It will not be added to your resume.',
  },
  {
    requirement: 'AWS (hands-on)',
    message: 'Only a foundational certification was found. No hands-on use of S3, Glue or Redshift is recorded.',
  },
]

export const DEFAULT_SELECTED = ['WEX-ERIC-04', 'PRJ-OLIST', 'SKL-DBT', 'PRJ-OLIST-01', 'WEX-ERIC-02']

export const evidenceById = (id: string) => EVIDENCE.find((e) => e.id === id)

// ---------------------------------------------------------------------------
// Resume draft bank. The mock generator keeps only bullets whose evidence is selected.

const b = (id: string, text: string, evidenceIds: string[], alternatives: string[] = []): Bullet => ({
  id,
  text,
  original: text,
  evidenceIds,
  alternatives,
})

const EXPERIENCE_BANK: Entry[] = [
  {
    id: 'exp-indg',
    heading: 'Indigitise Pvt Ltd',
    subheading: 'Intern – Data and AI',
    location: 'Canberra, ACT',
    dates: 'Jul 2026 – Oct 2026',
    bullets: [
      b(
        'b-indg-1',
        'Designed and built an AI model evaluation framework end to end as the sole developer, with CLI, FastAPI and Streamlit entry points over shared evaluation code.',
        ['WEX-INDG-01'],
        ['Built an AI evaluation framework as the only developer, exposing the same Python evaluation core through a CLI, a FastAPI service and a Streamlit UI.'],
      ),
      b(
        'b-indg-2',
        'Stored every evaluation run in PostgreSQL with pgvector and containerised the stack with Docker Compose, so past runs can be revisited and compared.',
        ['WEX-INDG-01'],
        ['Persisted evaluation runs and embeddings in PostgreSQL (pgvector) and packaged the services with Docker Compose.'],
      ),
    ],
  },
  {
    id: 'exp-eric',
    heading: 'Ericsson Global India',
    subheading: 'Associate Software Engineer',
    location: 'Chennai, India',
    dates: 'Feb 2022 – Jan 2025',
    bullets: [
      b(
        'b-eric-1',
        'Built an event-triggered Python ETL pipeline that extracts sprint data from the JIRA API, filters and enriches it, and publishes a structured release report to Confluence on every release.',
        ['WEX-ERIC-04'],
        [
          'Automated sprint release reporting with a Python ETL pipeline (JIRA API → filter → enrich → Confluence), triggered from each service’s release pipeline.',
          'Replaced a manual, per-sprint documentation task with a Python pipeline that pulls JIRA cards, enriches resolved items and loads release reports into Confluence.',
        ],
      ),
      b(
        'b-eric-2',
        'Monitored Jenkins pipelines across 12 internal and 8 downstream services as Build Master, tracing failures to the responsible change and coordinating workarounds; caught an estimated 90% of issues before release.',
        ['WEX-ERIC-02'],
        ['As Build Master for 20 services, triaged Jenkins pipeline failures to the responsible commit, reproduced them locally and coordinated fixes with downstream teams.'],
      ),
      b(
        'b-eric-3',
        'Restructured the test suite for the Secret Manager service after reproducing a production alarm bug, resolving most of its recurring pipeline failures.',
        ['WEX-ERIC-03'],
        ['Reproduced a production certificate-alarm bug with fake certificates, fixed it, and rebuilt the service’s outdated test suite.'],
      ),
      b(
        'b-eric-4',
        'Containerised and deployed microservices with Docker, Kubernetes and Helm within end-to-end CI/CD pipelines.',
        ['WEX-ERIC-01'],
        ['Deployed containerised microservices to Kubernetes using Helm and supported the team’s CI/CD pipelines.'],
      ),
      b(
        'b-eric-5',
        'Explained release failures to stakeholders in plain terms: cause, scope, time to fix, owning team and updated release date.',
        ['ABT-006a'],
      ),
    ],
  },
]

const PROJECT_BANK: Entry[] = [
  {
    id: 'prj-olist',
    heading: 'E-Commerce Analytics — Olist data warehouse',
    subheading: 'Python, PostgreSQL, dbt Core, Tableau, Docker Compose',
    dates: 'Aug 2026 – Sep 2026',
    bullets: [
      b(
        'b-olist-1',
        'Built a pipeline that loads raw CSVs into PostgreSQL with pandas and SQLAlchemy and transforms them in a three-layer dbt project feeding Tableau dashboards.',
        ['PRJ-OLIST'],
        ['Designed a load → transform → visualise pipeline: Python loader into PostgreSQL, dbt preprocessing, marts and insight models, and Tableau dashboards.'],
      ),
      b(
        'b-olist-2',
        'Diagnosed row multiplication from joining fact tables at different grains; fixed it by aggregating before joining and verified results against manual totals.',
        ['PRJ-OLIST-01', 'SKL-SQL'],
        ['Fixed a fan-out bug between two fact tables at different grains by pre-aggregating, then validated totals by hand.'],
      ),
      b(
        'b-olist-3',
        'Added dbt schema tests (unique, not_null, relationships, accepted_values and composite keys) to guard model quality.',
        ['SKL-DBT'],
        ['Guarded the warehouse with automated dbt tests covering uniqueness, nulls, referential integrity and accepted values.'],
      ),
    ],
  },
  {
    id: 'prj-voter',
    heading: 'Analysis of Indigenous Australian Voting Behaviour',
    subheading: 'Python, scikit-learn, mlxtend',
    dates: '2025',
    bullets: [
      b(
        'b-voter-1',
        'Profiled and cleaned survey special codes before modelling voter attitudes with decision trees, k-means and Apriori.',
        ['PRJ-VOTER'],
      ),
    ],
  },
]

const SUMMARY_ALTERNATIVES = [
  'Data engineering graduate with three years as a software engineer at Ericsson. Experienced in Python ETL, dbt and PostgreSQL warehouse modelling, automated data-quality tests and CI/CD, and in explaining technical issues to business stakeholders.',
  'Software engineer turned data engineer: three years of pipeline and CI/CD ownership at Ericsson, now completing a Master of Business Information Systems at ANU, with hands-on Python ETL, dbt and PostgreSQL work.',
]

export function generateResume(selectedIds: string[]): Resume {
  const has = (ids: string[]) => ids.some((id) => selectedIds.includes(id))
  const filterEntries = (bank: Entry[]) =>
    bank
      .map((entry) => ({ ...entry, bullets: entry.bullets.filter((bl) => has(bl.evidenceIds)).map((bl) => ({ ...bl })) }))
      .filter((entry) => entry.bullets.length > 0)

  const summaryText =
    'Graduate data engineer with three years of software engineering at Ericsson and a Master of Business Information Systems from ANU. Builds Python ETL pipelines, models warehouses with dbt and PostgreSQL, and writes automated data-quality tests.'

  return {
    name: 'Hariharasudhan K',
    contact: ['Canberra, ACT', 'hari.k@example.com', '+61 4XX XXX XXX', 'github.com/hariharasudhank01'],
    summary: b('summary', summaryText, ['WEX-ERIC-04', 'PRJ-OLIST', 'EDU-ANU'], SUMMARY_ALTERNATIVES),
    skills: [
      { id: 'sk-lang', label: 'Languages', items: 'Python, SQL', evidenceIds: ['SKL-SQL', 'WEX-ERIC-04'] },
      {
        id: 'sk-data',
        label: 'Data',
        items: 'PostgreSQL, dbt Core, pandas, SQLAlchemy, dimensional modelling, Tableau',
        evidenceIds: ['PRJ-OLIST', 'SKL-DBT'],
      },
      {
        id: 'sk-infra',
        label: 'Engineering',
        items: 'Docker, Kubernetes, Helm, Jenkins, Git, CI/CD, FastAPI',
        evidenceIds: ['WEX-ERIC-01', 'WEX-ERIC-02'],
      },
      {
        id: 'sk-cloud',
        label: 'Cloud',
        items: 'AWS (Certified Cloud Practitioner, foundational)',
        evidenceIds: ['EDU-CERT-AWS'],
      },
    ],
    experience: filterEntries(EXPERIENCE_BANK),
    projects: filterEntries(PROJECT_BANK),
    education: [
      {
        id: 'edu-anu',
        institution: 'The Australian National University',
        degree: 'Master of Business Information Systems',
        location: 'Canberra, ACT',
        dates: 'Feb 2025 – Nov 2026',
        evidenceId: 'EDU-ANU',
      },
      {
        id: 'edu-tce',
        institution: 'Thiagarajar College of Engineering',
        degree: 'Bachelor of Engineering, Computer Science and Engineering',
        location: 'Tamil Nadu, India',
        dates: '2018 – 2022',
        evidenceId: 'EDU-TCE',
      },
    ],
    certifications: ['AWS Certified Cloud Practitioner (2026)', 'Cloudera AI Technical Professional (2026)'],
  }
}

// ---------------------------------------------------------------------------

export const EVALUATION: Evaluation = {
  overall: 78,
  summary:
    'Strong, well-evidenced match on Python, SQL, ETL and data quality. The main gaps are hands-on cloud experience and workflow orchestration, which your knowledge base does not currently support.',
  categories: [
    {
      key: 'skills',
      label: 'Technical Skills',
      score: 82,
      summary: 'Most required skills appear with supporting bullets, not only in the skills list.',
      strengths: ['Python and SQL used in both work and project bullets', 'dbt and PostgreSQL backed by a full project'],
      gaps: ['Airflow not present', 'AWS listed as a certification only'],
      suggestion: 'Keep AWS framed as foundational. Do not list Airflow unless you have used it.',
    },
    {
      key: 'experience',
      label: 'Relevant Experience',
      score: 74,
      summary: 'Three years of engineering, but most of it is software delivery rather than data engineering.',
      strengths: ['A real ETL pipeline at Ericsson', 'Pipeline monitoring and triage ownership'],
      gaps: ['Data volume and frequency of the Ericsson pipeline not stated'],
      suggestion: 'If you know them, add the pipeline’s scale or the time it saved to your knowledge base.',
    },
    {
      key: 'projects',
      label: 'Projects and Achievements',
      score: 80,
      summary: 'The Olist project maps closely to the role and shows judgement, not just tooling.',
      strengths: ['Grain mismatch fix shows modelling depth', 'Automated dbt tests'],
      gaps: ['Business findings from the project are not mentioned'],
      suggestion: 'Add one line on what the analysis found, using the findings already in projects.md.',
    },
    {
      key: 'requirements',
      label: 'Job Requirements',
      score: 71,
      summary: 'All five required skills are covered; two of four preferred skills are partial or missing.',
      strengths: ['Required: 5 of 5 covered', 'dbt and Docker preferred skills covered'],
      gaps: ['AWS partial', 'Airflow missing'],
      suggestion: 'Address gaps through real experience or a cover letter, not resume wording.',
    },
    {
      key: 'quality',
      label: 'Resume Quality',
      score: 84,
      summary: 'Clear, concise bullets that start with verbs and fit on one page.',
      strengths: ['Consistent tense and structure', 'One page'],
      gaps: ['Few quantified outcomes', 'One figure is a self-estimate'],
      suggestion: 'Label estimates honestly if asked in interview, and add measured figures where you have them.',
    },
  ],
  coverage: [
    {
      requirement: 'Python development',
      coverage: 'strong',
      evidence: 'Ericsson ETL pipeline; AI Eval framework; Olist loader',
      evidenceIds: ['WEX-ERIC-04', 'WEX-INDG-01', 'PRJ-OLIST'],
      action: 'No action needed.',
    },
    {
      requirement: 'SQL proficiency',
      coverage: 'strong',
      evidence: 'dbt models with CTEs and window functions; grain mismatch fix',
      evidenceIds: ['SKL-SQL', 'PRJ-OLIST-01'],
      action: 'No action needed.',
    },
    {
      requirement: 'ETL pipeline development',
      coverage: 'strong',
      evidence: 'JIRA → Confluence pipeline; Olist load → dbt → Tableau',
      evidenceIds: ['WEX-ERIC-04', 'PRJ-OLIST'],
      action: 'Consider adding scale or frequency if known.',
    },
    {
      requirement: 'Data quality testing',
      coverage: 'strong',
      evidence: 'dbt schema tests; validation against manual totals',
      evidenceIds: ['SKL-DBT', 'PRJ-OLIST-01'],
      action: 'No action needed.',
    },
    {
      requirement: 'Cloud infrastructure',
      coverage: 'partial',
      evidence: 'AWS Cloud Practitioner (foundational); Docker and Kubernetes, not cloud-hosted',
      evidenceIds: ['EDU-CERT-AWS', 'WEX-ERIC-01'],
      action: 'Record any hands-on AWS work in your knowledge base. Otherwise leave as is.',
    },
    {
      requirement: 'Workflow orchestration (Airflow)',
      coverage: 'missing',
      evidence: 'No supporting evidence in your knowledge base.',
      evidenceIds: [],
      action: 'Do not add. Mention willingness to learn in a cover letter if relevant.',
    },
  ],
  recommendations: [
    {
      title: 'Add a concrete example of pipeline ownership',
      why: 'The Ericsson ETL bullet describes what the pipeline does, but not its scale, frequency or the time it saved. Reviewers look for evidence that you owned a pipeline in production.',
      priority: 'high',
    },
    {
      title: 'Strengthen the evidence for cloud platform experience',
      why: 'AWS is a preferred skill and currently rests on a foundational certification. Only add more if you have real hands-on work to record in skills.md.',
      priority: 'high',
    },
    {
      title: 'Clarify the impact of the Olist project',
      why: 'The project shows strong technique. One line on what the analysis found (for example, growth depending on new customers) shows you connect data to business questions.',
      priority: 'medium',
    },
    {
      title: 'Qualify the 90% figure if you keep it',
      why: 'It is recorded as your own estimate. Keep the wording "an estimated" so it holds up in an interview.',
      priority: 'low',
    },
  ],
}

export const PARTIAL_CATEGORIES = ['skills', 'experience', 'quality']
