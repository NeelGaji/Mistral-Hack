import SceneContainer from './components/SceneContainer'
import HUD from './components/HUD'
import { WebsiteProvider } from './context/WebsiteContext'
import './App.css'

function App() {
  return (
    <WebsiteProvider>
      <div className="app">
        <SceneContainer />
        <HUD />
      </div>
    </WebsiteProvider>
  )
}

export default App
