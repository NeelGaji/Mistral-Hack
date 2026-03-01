import { PersonaConfig } from '../data/personas'

interface Props {
  persona: PersonaConfig
  active: boolean
  onClick: () => void
}

export default function PersonaCard({ persona, active, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '12px 18px',
        borderRadius: '12px',
        border: `2px solid ${active ? persona.color : 'rgba(255,255,255,0.08)'}`,
        background: active ? `${persona.color}18` : 'rgba(255,255,255,0.02)',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        minWidth: '140px',
        transform: active ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: active ? `0 4px 20px ${persona.color}33` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: persona.color,
            boxShadow: active ? `0 0 10px ${persona.color}` : 'none',
            flexShrink: 0,
            transition: 'box-shadow 0.25s',
          }}
        />
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: active ? persona.color : '#aaa',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          transition: 'color 0.2s',
        }}>
          {persona.name}
        </span>
      </div>
      <span style={{ fontSize: 10, color: active ? '#888' : '#444', letterSpacing: '0.5px' }}>
        {persona.clusterLabel}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: active ? persona.color : '#555' }}>
        {persona.userShare}%
      </span>
    </div>
  )
}