import { useRef, useState } from 'react';
import { PERSONAS, PersonaConfig } from '../data/personas';
import { useStore } from '../store/useStore';
import { clearHeatmap } from './HeatmapOverlay';
import * as THREE from 'three';
import './HUD.css';

export default function HUD() {
  const mode = useStore((s) => s.mode);
  const activePersona = useStore((s) => s.activePersona);
  const isAnimating = useStore((s) => s.isAnimating);
  const speed = useStore((s) => s.speed);
  const viewMode = useStore((s) => s.viewMode);
  const showAllCursors = useStore((s) => s.showAllCursors);
  const simulationRunning = useStore((s) => s.simulationRunning);
  const simulationProgress = useStore((s) => s.simulationProgress);
  const heatmapVisible = useStore((s) => s.heatmapVisible);
  const toggleHeatmap = useStore((s) => s.toggleHeatmap);

  const setMode = useStore((s) => s.setMode);
  const selectPersona = useStore((s) => s.selectPersona);
  const toggleAnimation = useStore((s) => s.toggleAnimation);
  const setSpeed = useStore((s) => s.setSpeed);
  const setViewMode = useStore((s) => s.setViewMode);
  const setShowAllCursors = useStore((s) => s.setShowAllCursors);
  const toggleSimulation = useStore((s) => s.toggleSimulation);

  const isSimView = viewMode === 'simulation' || viewMode === 'both';

  return (
    <div className="hud">
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-title">
          <span className="hud-logo">◆</span> AGENTIC WORLD
          <span className="hud-subtitle">Behavioral Demographics Visualizer</span>
        </div>
        <div className="hud-controls">
          {/* View mode toggles */}
          <div className="view-mode-group">
            <button
              className={`hud-btn ${viewMode === 'particles' ? 'active' : ''}`}
              onClick={() => setViewMode('particles')}
            >
              PARTICLES
            </button>
            <button
              className={`hud-btn ${viewMode === 'simulation' ? 'active' : ''}`}
              onClick={() => setViewMode('simulation')}
            >
              SIMULATION
            </button>
            <button
              className={`hud-btn ${viewMode === 'both' ? 'active' : ''}`}
              onClick={() => setViewMode('both')}
            >
              BOTH
            </button>
          </div>

          <span className="hud-divider">|</span>

          {/* Particle-specific controls */}
          {viewMode === 'particles' && (
            <>
              <button
                className={`hud-btn ${mode === 'race' ? 'active' : ''}`}
                onClick={() => setMode('race')}
              >
                SPLIT VIEW
              </button>
              <button
                className={`hud-btn ${mode === 'solo' ? 'active' : ''}`}
                onClick={() => setMode('solo')}
              >
                SOLO
              </button>
              <span className="hud-divider">|</span>
              <button className="hud-btn" onClick={toggleAnimation}>
                {isAnimating ? '⏸ PAUSE' : '▶ PLAY'}
              </button>
            </>
          )}

          {/* Simulation-specific controls */}
          {isSimView && (
            <>
              <button
                className={`hud-btn ${showAllCursors ? 'active' : ''}`}
                onClick={() => setShowAllCursors(true)}
              >
                ALL AGENTS
              </button>
              <button
                className={`hud-btn ${!showAllCursors ? 'active' : ''}`}
                onClick={() => setShowAllCursors(false)}
              >
                SOLO AGENT
              </button>
              <span className="hud-divider">|</span>
              <button className="hud-btn" onClick={toggleSimulation}>
                {simulationRunning ? '⏸ PAUSE' : '▶ PLAY'}
              </button>
              <span className="hud-divider">|</span>
              <button
                className={`hud-btn ${heatmapVisible ? 'active' : ''}`}
                onClick={toggleHeatmap}
              >
                🔥 HEATMAP
              </button>
              <button onClick={() => {
  clearHeatmap()}}>
                CLEAR MAP
              </button>
            </>
          )}

          {/* Speed control (shared) */}
          <div className="speed-control">
            <label>SPEED</label>
            <input
              type="range"
              min={0.2}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <span>{speed.toFixed(1)}x</span>
          </div>
        </div>
      </div>

      {/* Simulation progress bar */}
      {isSimView && (
        <div className="sim-progress-bar">
          <div className="sim-progress-fill" style={{ width: `${simulationProgress * 100}%` }} />
        </div>
      )}

      {/* URL input for simulation mode */}
      {isSimView && <UrlInput />}

      {/* Persona selector cards */}
      <div className="hud-personas">
        {PERSONAS.map((p) => (
          <PersonaCard
            key={p.id}
            persona={p}
            isActive={
              isSimView
                ? !showAllCursors && activePersona === p.id
                : mode === 'solo' && activePersona === p.id
            }
            onClick={() => {
              selectPersona(p.id);
              if (isSimView) setShowAllCursors(false);
            }}
          />
        ))}
      </div>

      {/* Active persona detail */}
      {((!isSimView && mode === 'solo' && activePersona !== null) ||
        (isSimView && !showAllCursors && activePersona !== null)) && (
        <PersonaDetail persona={PERSONAS[activePersona]} />
      )}
    </div>
  );
}

function UrlInput() {
  const [url, setUrl] = useState('');
  const isCapturing = useStore((s) => s.isCapturing);
  const setIsCapturing = useStore((s) => s.setIsCapturing);
  const setWebsiteTexture = useStore((s) => s.setWebsiteTexture);
  const setWebsiteUrl = useStore((s) => s.setWebsiteUrl);
  const setLiveUrl = useStore((s) => s.setLiveUrl);
  const liveUrl = useStore((s) => s.liveUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');

  const handleLive = () => {
    if (!url.trim()) return;
    setError('');
    setWebsiteTexture(null);
    setLiveUrl(url);
    setWebsiteUrl(url);
  };

  const loadTextureFromUrl = (imageUrl: string): Promise<THREE.Texture> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve(texture);
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = imageUrl;
    });
  };

  const handleCapture = async () => {
    if (!url.trim()) return;
    setIsCapturing(true);
    setWebsiteUrl(url);
    setError('');

    // Strategy 1: Try Google PageSpeed Insights API (free, no key needed for thumbnails)
    try {
      const psApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=PERFORMANCE&strategy=DESKTOP`;
      const res = await fetch(psApiUrl);
      if (res.ok) {
        const data = await res.json();
        const screenshot = data?.lighthouseResult?.audits?.['final-screenshot']?.details?.data;
        if (screenshot) {
          // It's a base64 data URL
          const texture = await loadTextureFromUrl(screenshot);
          setWebsiteTexture(texture);
          setIsCapturing(false);
          return;
        }
      }
    } catch (e) {
      console.warn('PageSpeed screenshot failed, trying next strategy...', e);
    }

    // Strategy 2: Try loading the URL directly as an image (works if URL points to an image)
    try {
      const texture = await loadTextureFromUrl(url);
      setWebsiteTexture(texture);
      setIsCapturing(false);
      return;
    } catch (e) {
      console.warn('Direct image load failed, trying next strategy...', e);
    }

    // Strategy 3: Use thum.io free screenshot service
    try {
      const thumUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${url}`;
      const texture = await loadTextureFromUrl(thumUrl);
      setWebsiteTexture(texture);
      setIsCapturing(false);
      return;
    } catch (e) {
      console.warn('thum.io screenshot failed', e);
    }

    setError('Capture failed — use UPLOAD to load a screenshot manually');
    setIsCapturing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        setWebsiteTexture(texture);
        setWebsiteUrl(file.name);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setWebsiteTexture(null);
    setWebsiteUrl('');
    setLiveUrl('');
    setUrl('');
    setError('');
  };

  return (
    <div className="url-input-bar">
      <input
        type="text"
        className="url-input"
        placeholder="Paste website URL to test..."
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(''); }}
        onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
      />
      <button className="hud-btn live-btn" onClick={handleLive}>
        🌐 LIVE
      </button>
      <button className="hud-btn capture-btn" onClick={handleCapture} disabled={isCapturing}>
        {isCapturing ? '⏳ CAPTURING...' : '📷 CAPTURE'}
      </button>
      <button className="hud-btn" onClick={() => fileInputRef.current?.click()}>
        📁 UPLOAD
      </button>
      <button className="hud-btn" onClick={handleReset}>
        ↺ RESET
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      {error && <span className="url-error">{error}</span>}
      {liveUrl && <span className="url-live-badge">LIVE: {liveUrl}</span>}
    </div>
  );
}

function PersonaCard({
  persona,
  isActive,
  onClick,
}: {
  persona: PersonaConfig;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`persona-card ${isActive ? 'active' : ''}`}
      style={{ borderColor: persona.color }}
      onClick={onClick}
    >
      <div className="persona-dot" style={{ background: persona.color }} />
      <div className="persona-info">
        <span className="persona-name">{persona.name}</span>
        <span className="persona-cluster">
          {persona.clusterLabel} · {persona.userShare}%
        </span>
      </div>
    </button>
  );
}

function PersonaDetail({ persona }: { persona: PersonaConfig }) {
  const { metrics } = persona;
  return (
    <div className="persona-detail" style={{ borderColor: persona.color }}>
      <h3 style={{ color: persona.color }}>{persona.name}</h3>
      <p className="persona-desc">{persona.description}</p>
      <div className="metrics-grid">
        <MetricBar label="Click Latency" value={metrics.avgClickLatencyMs} unit="ms" max={5000} color={persona.color} />
        <MetricBar label="Scroll Speed" value={metrics.scrollSpeedPxS} unit="px/s" max={5000} color={persona.color} />
        <MetricBar label="Hesitation" value={metrics.hesitationFrequency * 100} unit="%" max={100} color={persona.color} />
        <MetricBar label="Click/Scroll" value={metrics.clickToScrollRatio * 100} unit="%" max={100} color={persona.color} />
        <MetricBar label="Completion" value={metrics.taskCompletionRate * 100} unit="%" max={100} color={persona.color} />
        <MetricBar label="Dead Clicks" value={metrics.deadClickRate * 100} unit="%" max={100} color={persona.color} />
      </div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  unit,
  max,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="metric-bar">
      <div className="metric-label">
        <span>{label}</span>
        <span>
          {value.toFixed(0)} {unit}
        </span>
      </div>
      <div className="metric-track">
        <div
          className="metric-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
