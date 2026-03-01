import { PersonaConfig } from '../data/personas'

interface Props {
  persona: PersonaConfig
}

const BARS = [
  { label: 'Task Completion Rate', key: 'taskCompletionRate', max: 1 },
  { label: 'Hesitation Frequency', key: 'hesitationFrequency', max: 1 },
  { label: 'Dead Click Rate', key: 'deadClickRate', max: 1 },
  { label: 'Click:Scroll Ratio', key: 'clickToScrollRatio', max: 1 },
] as const

export default function MetricsChart({ persona }: Props) {
  return (
    <div style={{ width: '100%' }}>
      <p style={{ fontSize: 11, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 24 }}>
        Behavioral Profile
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {BARS.map((bar) => {
          const raw = persona.metrics[bar.key]
          const pct = Math.min(100, (raw / bar.max) * 100)
          return (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#777', letterSpacing: 0.5 }}>{bar.label}</span>
                <span style={{ fontSize: 12, color: persona.color, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
              </div>
              <div style={{
                height: 8,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${persona.color}aa, ${persona.color})`,
                    boxShadow: `0 0 10px ${persona.color}66`,
                    transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}