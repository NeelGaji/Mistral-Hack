import { useStore } from '../store/useStore';

export default function WebsiteIframe() {
  const liveUrl = useStore((s) => s.liveUrl);
  const viewMode = useStore((s) => s.viewMode);
  const simulationRunning = useStore((s) => s.simulationRunning);

  const isSimView = viewMode === 'simulation' || viewMode === 'both';

  if (!isSimView || !liveUrl) return null;

  return (
    <div
      className="website-iframe-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050510',
        pointerEvents: simulationRunning ? 'none' : 'auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '75vw',
          height: '80vh',
          border: '1px solid rgba(100, 100, 255, 0.2)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 0 40px rgba(50, 50, 200, 0.15)',
        }}
      >
        <iframe
          src={liveUrl}
          title="Website Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#fff',
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    </div>
  );
}
