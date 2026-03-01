import { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

/** Public API for external cursor interaction */
export interface InteractiveWebsiteHandle {
  simulateClick: (hotspotId: string) => void;
  simulateHover: (hotspotId: string, active: boolean) => void;
  simulateScroll: (deltaY: number) => void;
  getScrollY: () => number;
  getContainerEl: () => HTMLDivElement | null;
}

const InteractiveWebsite = forwardRef<InteractiveWebsiteHandle, { width: number; height: number }>(
  ({ width, height }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const clickTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const simulateClick = useCallback((hotspotId: string) => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

      const el = containerRef.current?.querySelector(`[data-hotspot-id="${hotspotId}"]`) as HTMLElement;
      if (el) {
        el.classList.add('agent-clicked');
        clickTimeoutRef.current = setTimeout(() => el.classList.remove('agent-clicked'), 400);
      }
    }, []);

    const simulateHover = useCallback((hotspotId: string, active: boolean) => {
      const el = containerRef.current?.querySelector(`[data-hotspot-id="${hotspotId}"]`) as HTMLElement;
      if (el) {
        if (active) el.classList.add('agent-hovered');
        else el.classList.remove('agent-hovered');
      }
    }, []);

    const simulateScroll = useCallback((deltaY: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop += deltaY;
      }
    }, []);

    const getScrollY = useCallback(() => {
      return containerRef.current?.scrollTop ?? 0;
    }, []);

    const getContainerEl = useCallback(() => {
      return containerRef.current;
    }, []);

    useImperativeHandle(ref, () => ({
      simulateClick,
      simulateHover,
      simulateScroll,
      getScrollY,
      getContainerEl,
    }));

    return (
      <div
        ref={containerRef}
        className="iw-root"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          overflow: 'hidden',
          overflowY: 'auto',
          background: '#0a0a1a',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          color: '#e0e0ff',
          position: 'relative',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <style>{`
          .iw-root::-webkit-scrollbar { width: 4px; }
          .iw-root::-webkit-scrollbar-track { background: #111; }
          .iw-root::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
          
          .agent-clicked {
            animation: agentClick 0.4s ease-out !important;
          }
          .agent-hovered {
            box-shadow: 0 0 20px rgba(100, 100, 255, 0.4), inset 0 0 10px rgba(100, 100, 255, 0.1) !important;
            border-color: rgba(100, 100, 255, 0.6) !important;
          }
          @keyframes agentClick {
            0% { transform: scale(1); filter: brightness(1); }
            15% { transform: scale(0.95); filter: brightness(1.5); }
            30% { transform: scale(1.02); filter: brightness(1.3); }
            100% { transform: scale(1); filter: brightness(1); }
          }
          
          .iw-btn {
            transition: all 0.15s ease;
            cursor: pointer;
            border: 1px solid transparent;
          }
          .iw-btn:hover, .iw-btn.agent-hovered {
            filter: brightness(1.2);
          }
          .iw-link {
            transition: color 0.15s ease, text-shadow 0.15s ease;
            border: 1px solid transparent;
          }
          .iw-link.agent-hovered {
            text-shadow: 0 0 8px currentColor;
          }
          .iw-card {
            transition: all 0.2s ease;
            border: 1px solid rgba(255,255,255,0.06);
          }
          .iw-card.agent-hovered {
            border-color: rgba(100, 100, 255, 0.4);
            transform: translateY(-2px);
          }
          .iw-card.agent-clicked {
            border-color: rgba(100, 100, 255, 0.8);
          }
          .iw-nav-item {
            transition: color 0.15s ease;
            border: 1px solid transparent;
          }
          .iw-nav-item.agent-hovered {
            color: #aabbff !important;
          }
          .iw-input-field {
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
          }
          .iw-input-field.agent-hovered, .iw-input-field.agent-clicked {
            border-color: #5566ff !important;
            box-shadow: 0 0 12px rgba(80,80,255,0.3);
          }
        `}</style>

        {/* === NAVBAR === */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', background: '#0d0d22', borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div data-hotspot-id="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#5566ff', fontSize: 20, fontWeight: 700 }}>◆</span>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>MegaPlan</span>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <span data-hotspot-id="nav-features" className="iw-nav-item" style={{ fontSize: 13, color: '#999', letterSpacing: 0.3 }}>Features</span>
            <span data-hotspot-id="nav-pricing" className="iw-nav-item" style={{ fontSize: 13, color: '#999', letterSpacing: 0.3 }}>Pricing</span>
            <span data-hotspot-id="nav-docs" className="iw-nav-item" style={{ fontSize: 13, color: '#999', letterSpacing: 0.3 }}>Docs</span>
            <span data-hotspot-id="nav-login" className="iw-link" style={{ fontSize: 13, color: '#aaa', letterSpacing: 0.3 }}>Login</span>
            <div data-hotspot-id="nav-signup" className="iw-btn" style={{
              background: 'linear-gradient(135deg, #4455dd, #6677ff)',
              padding: '7px 18px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#fff',
              letterSpacing: 0.3,
            }}>
              Sign Up
            </div>
          </div>
        </nav>

        {/* === HERO === */}
        <section style={{ textAlign: 'center', padding: '60px 40px 40px' }}>
          <div data-hotspot-id="hero-title" style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: -1, marginBottom: 16 }}>
            Build <span style={{ background: 'linear-gradient(90deg, #5566ff, #88aaff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Better Products</span>
          </div>
          <p data-hotspot-id="hero-subtitle" style={{ color: '#888', fontSize: 15, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
            AI-powered behavioral analytics that help modern teams understand how real users interact with their products.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div data-hotspot-id="hero-cta" className="iw-btn" style={{
              background: 'linear-gradient(135deg, #3344dd, #5566ff)',
              padding: '12px 32px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff',
              boxShadow: '0 4px 20px rgba(50,60,200,0.3)',
            }}>
              Get Started Free
            </div>
            <div data-hotspot-id="hero-secondary" className="iw-link" style={{
              padding: '12px 24px', borderRadius: 8, fontSize: 14, color: '#6677ff',
              border: '1px solid rgba(100,100,255,0.25)',
            }}>
              Learn More →
            </div>
          </div>
        </section>

        {/* === HERO IMAGE === */}
        <div data-hotspot-id="hero-image" style={{
          margin: '0 32px 48px', borderRadius: 12, overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d0d28, #12123a)',
          border: '1px solid rgba(255,255,255,0.06)',
          height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ color: '#444', fontSize: 13 }}>Dashboard Preview</div>
            {/* Fake metrics row */}
            <div style={{ display: 'flex', gap: 24, marginTop: 12, justifyContent: 'center' }}>
              {['2.4k Users', '89% Conv.', '1.2s Avg'].map((m, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#5566ff', fontSize: 16, fontWeight: 700 }}>{m.split(' ')[0]}</div>
                  <div style={{ color: '#555', fontSize: 10 }}>{m.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === FEATURE CARDS === */}
        <section style={{ padding: '0 32px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Powerful Features</div>
            <p style={{ color: '#666', fontSize: 13 }}>Everything you need to understand user behavior</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { id: 'card-1', icon: '🔍', title: 'Behavioral Analytics', desc: 'Track clicks, scrolls, and micro-interactions with ML-powered clustering.' },
              { id: 'card-2', icon: '🤖', title: 'AI Agents', desc: 'Deploy autonomous agents that simulate real user personas on any website.' },
              { id: 'card-3', icon: '📈', title: 'Smart Insights', desc: 'Get actionable recommendations based on behavioral pattern analysis.' },
            ].map((card) => (
              <div key={card.id} data-hotspot-id={card.id} className="iw-card" style={{
                background: '#0e0e28', borderRadius: 10, padding: 20,
              }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{card.title}</div>
                <p style={{ color: '#777', fontSize: 12, lineHeight: 1.5 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* === TESTIMONIALS / SOCIAL PROOF === */}
        <section style={{ padding: '32px', background: '#0c0c24', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Trusted by 500+ Teams</div>
            <p style={{ color: '#666', fontSize: 12 }}>From startups to enterprise</p>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            {['Acme Corp', 'TechFlow', 'DataSync', 'CloudBase'].map((name, i) => (
              <div key={i} style={{
                background: '#111130', borderRadius: 8, padding: '10px 20px',
                color: '#555', fontSize: 12, fontWeight: 600, border: '1px solid rgba(255,255,255,0.04)',
              }}>
                {name}
              </div>
            ))}
          </div>
        </section>

        {/* === PRICING SECTION === */}
        <section style={{ padding: '48px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Simple Pricing</div>
            <p style={{ color: '#666', fontSize: 13 }}>Start free, scale as you grow</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, maxWidth: 600, margin: '0 auto' }}>
            {[
              { name: 'Free', price: '$0', features: ['1k events/mo', 'Basic analytics', '1 agent'] },
              { name: 'Pro', price: '$49', features: ['100k events/mo', 'Advanced insights', '10 agents'], highlight: true },
              { name: 'Enterprise', price: 'Custom', features: ['Unlimited events', 'Custom models', 'Dedicated support'] },
            ].map((plan, i) => (
              <div key={i} style={{
                background: plan.highlight ? 'linear-gradient(135deg, #15154a, #1a1a55)' : '#0e0e28',
                borderRadius: 10, padding: 20, textAlign: 'center',
                border: plan.highlight ? '1px solid rgba(100,100,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: plan.highlight ? '#88aaff' : '#aaa' }}>{plan.name}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{plan.price}</div>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>✓ {f}</div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* === BOTTOM CTA === */}
        <section style={{ textAlign: 'center', padding: '48px 32px', background: 'linear-gradient(180deg, transparent, rgba(50,60,200,0.08))' }}>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Ready to Get Started?</div>
          <p style={{ color: '#777', fontSize: 13, marginBottom: 24 }}>Join thousands of teams improving their user experience</p>
          <div data-hotspot-id="bottom-cta" className="iw-btn" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #3344dd, #5566ff)',
            padding: '14px 48px', borderRadius: 8, fontSize: 15, fontWeight: 600, color: '#fff',
            boxShadow: '0 4px 24px rgba(50,60,200,0.35)',
          }}>
            Start Your Free Trial
          </div>
        </section>

        {/* === FOOTER === */}
        <footer style={{
          padding: '24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ color: '#444', fontSize: 11 }}>© 2025 MegaPlan. All rights reserved.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <span data-hotspot-id="footer-1" className="iw-link" style={{ color: '#555', fontSize: 11 }}>Terms</span>
            <span data-hotspot-id="footer-2" className="iw-link" style={{ color: '#555', fontSize: 11 }}>Privacy</span>
            <span data-hotspot-id="footer-3" className="iw-link" style={{ color: '#555', fontSize: 11 }}>Contact</span>
          </div>
        </footer>
      </div>
    );
  }
);

InteractiveWebsite.displayName = 'InteractiveWebsite';
export default InteractiveWebsite;
