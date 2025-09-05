import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import WorkoutLog from './pages/WorkoutLog'
import Progress from './pages/Progress'
import Subscription from './pages/Subscription'
import { useAppContext } from './contexts/AppContext'

function App() {
  const { user } = useAppContext()

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/log" element={<WorkoutLog />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/subscription" element={<Subscription />} />
      </Routes>
    </Layout>
  )
}

export default App