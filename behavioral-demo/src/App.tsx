import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import SceneContainer from './components/SceneContainer'
import HUD from './components/HUD'
import WebsiteIframe from './components/WebsiteIframe'
import DemographicsPanel from './components/DemographicsPanel'
import FloatingNavButton from './components/FloatingNavButton'
import './App.css'

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [location.pathname])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.45s ease, transform 0.45s ease',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  )
}

function MainView() {
  return (
    <div className="app">
      <WebsiteIframe />
      <SceneContainer />
      <HUD />
      <FloatingNavButton to="/demographics" label="View Report" />
    </div>
  )
}

function DemographicsView() {
  return (
    <div className="app" style={{ overflowY: 'auto' }}>
      <DemographicsPanel />
      <FloatingNavButton to="/" label="← Back to Viz" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PageWrapper>
            <MainView />
          </PageWrapper>
        }
      />
      <Route
        path="/demographics"
        element={
          <PageWrapper>
            <DemographicsView />
          </PageWrapper>
        }
      />
    </Routes>
  )
}