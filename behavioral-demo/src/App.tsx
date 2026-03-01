import SceneContainer from './components/SceneContainer'
import HUD from './components/HUD'
import WebsiteIframe from './components/WebsiteIframe'
import './App.css'

function App() {
  return (
    <div className="app">
      <WebsiteIframe />
      <SceneContainer />
      <HUD />
    </div>
  )
}

export default App
