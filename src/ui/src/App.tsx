import { useEffect, useRef } from 'react'
import { Sidebar, WorkflowBar } from './components/Shell'
import { useStore } from './state/store'
import { EvaluationScreen } from './screens/EvaluationScreen'
import { EvidenceScreen } from './screens/EvidenceScreen'
import { JobDescriptionScreen } from './screens/JobDescriptionScreen'
import { HistoryScreen, KnowledgeBaseScreen } from './screens/LibraryScreens'
import { ResumeEditorScreen } from './screens/ResumeEditorScreen'

const SCREENS = [JobDescriptionScreen, EvidenceScreen, ResumeEditorScreen, EvaluationScreen]

export default function App() {
  const { state } = useStore()
  const main = useRef<HTMLElement>(null)

  useEffect(() => {
    main.current?.scrollTo({ top: 0 })
  }, [state.stage, state.view])

  const Screen = SCREENS[state.stage]

  return (
    <div className="app">
      <Sidebar />
      <div className="main-col">
        {state.view === 'build' && <WorkflowBar />}
        <main ref={main} className="main">
          {state.view === 'build' ? <Screen /> : state.view === 'knowledge' ? <KnowledgeBaseScreen /> : <HistoryScreen />}
        </main>
      </div>
    </div>
  )
}
