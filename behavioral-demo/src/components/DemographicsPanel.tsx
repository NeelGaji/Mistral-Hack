import { useState } from 'react'
import { PERSONAS } from '../data/personas'
import PersonaCard from './PersonaCard'
import MetricsChart from './MetricsChart'
import './DemographicsPanel.css'

export default function DemographicsPanel() {
  const [selected, setSelected] = useState(0)
  const persona = PERSONAS[selected]

  return (
    <div className="demo-panel">

      {/* ── Header ── */}
      <div className="demo-header">
        <span className="demo-logo">◆</span>
        <div>
          <h1 className="demo-title">Behavioral Demographics</h1>
          <p className="demo-subtitle">User Cluster Analysis · Agentic World</p>
        </div>
        <div className="demo-header-badge">
          {PERSONAS.length} Clusters · {PERSONAS.reduce((a, p) => a + p.userShare, 0)}% Coverage
        </div>
      </div>

      {/* ── Persona Selector ── */}
      <div className="demo-persona-row">
        {PERSONAS.map((p, i) => (
          <PersonaCard
            key={p.id}
            persona={p}
            active={selected === i}
            onClick={() => setSelected(i)}
          />
        ))}
      </div>

      {/* ── Detail Section ── */}
      <div className="demo-detail">

        {/* Left: Metrics */}
        <div className="demo-info">
          <div className="demo-persona-heading">
            <div className="demo-persona-dot" style={{ background: persona.color, boxShadow: `0 0 12px ${persona.color}` }} />
            <h2 style={{ color: persona.color }}>{persona.name}</h2>
          </div>
          <p className="demo-cluster">{persona.clusterLabel} · <strong style={{ color: persona.color }}>{persona.userShare}%</strong> of users</p>
          <p className="demo-desc">{persona.description}</p>

          <div className="demo-metrics-grid">
            {[
              { label: 'Avg Click Latency', value: `${persona.metrics.avgClickLatencyMs}ms` },
              { label: 'Scroll Speed', value: `${persona.metrics.scrollSpeedPxS} px/s` },
              { label: 'Task Completion', value: `${(persona.metrics.taskCompletionRate * 100).toFixed(0)}%` },
              { label: 'Dead Click Rate', value: `${(persona.metrics.deadClickRate * 100).toFixed(0)}%` },
              { label: 'Hesitation Freq.', value: `${(persona.metrics.hesitationFrequency * 100).toFixed(0)}%` },
              { label: 'Click:Scroll', value: persona.metrics.clickToScrollRatio.toFixed(2) },
            ].map(({ label, value }) => (
              <div className="metric-item" key={label} style={{ borderColor: `${persona.color}33` }}>
                <span className="metric-label">{label}</span>
                <span className="metric-value" style={{ color: persona.color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chart */}
        <div className="demo-chart-area">
          <MetricsChart persona={persona} />
        </div>
      </div>

      {/* ── User Share Overview ── */}
      <div className="demo-share-section">
        <h3 className="demo-section-title">User Share Distribution</h3>
        <div className="demo-share-bars">
          {PERSONAS.map((p) => (
            <div
              key={p.id}
              className={`share-row ${selected === p.id ? 'share-row-active' : ''}`}
              onClick={() => setSelected(p.id)}
            >
              <span className="share-name" style={{ color: p.color }}>{p.name}</span>
              <div className="share-track">
                <div
                  className="share-fill"
                  style={{ width: `${p.userShare}%`, background: p.color, boxShadow: `0 0 8px ${p.color}66` }}
                />
              </div>
              <span className="share-pct" style={{ color: p.color }}>{p.userShare}%</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}