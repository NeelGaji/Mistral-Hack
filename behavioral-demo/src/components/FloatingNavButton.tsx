import { useNavigate } from 'react-router-dom'
import './FloatingNavButton.css'

interface Props {
  to: string
  label: string
}

export default function FloatingNavButton({ to, label }: Props) {
  const navigate = useNavigate()

  return (
    <button
      className="floating-nav-btn"
      onClick={() => navigate(to)}
      title={label}
    >
      <span className="floating-nav-icon">◆</span>
      <span className="floating-nav-label">{label}</span>
    </button>
  )
}