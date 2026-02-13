import { useState, useEffect, useCallback } from 'react'
import './App.css'
import heroImage from './assets/uptrend-hero.jpg'
import CandlestickChart from './CandlestickChart'

const CA = '6iJ2sTaqdCBzjpdTsBmYtPZLtSzfdHE829dtMGofpump'

/* ---- Matrix-style dollar rain ---- */
function DollarRain() {
  const columns = 30
  const drops = Array.from({ length: columns }, (_, i) => {
    const delay = Math.random() * 8
    const duration = 4 + Math.random() * 6
    const left = (i / columns) * 100 + Math.random() * (100 / columns)
    const size = 14 + Math.random() * 22
    const opacity = 0.08 + Math.random() * 0.18
    return (
      <span
        key={i}
        className="rain-drop"
        style={{
          left: `${left}%`,
          fontSize: `${size}px`,
          opacity,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      >
        $
      </span>
    )
  })
  return <div className="dollar-rain">{drops}</div>
}

/* ---- Floating particles ---- */
function Particles() {
  const count = 20
  const particles = Array.from({ length: count }, (_, i) => {
    const size = 3 + Math.random() * 6
    const left = Math.random() * 100
    const delay = Math.random() * 10
    const duration = 8 + Math.random() * 12
    return (
      <span
        key={i}
        className="particle"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${left}%`,
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    )
  })
  return <div className="particles">{particles}</div>
}

/* ---- Marquee ticker ---- */
function Marquee() {
  const text = '$UPTREND  ·  TO THE MOON  ·  100X INCOMING  ·  BUY NOW  ·  WAGMI  ·  LFG  ·  DIAMOND HANDS  ·  NO BRAKES  ·  '
  return (
    <div className="marquee-wrapper">
      <div className="marquee-track">
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  )
}

/* ---- Animated counter ---- */
function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [target])

  return <span>{prefix}{value.toLocaleString()}{suffix}</span>
}

/* ---- Main App ---- */
function App() {
  const [copied, setCopied] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  const handleScroll = useCallback(() => {
    setScrollY(window.scrollY)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleCopy = () => {
    navigator.clipboard.writeText(CA)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="app">
      {/* ===== DOLLAR RAIN (global) ===== */}
      <DollarRain />
      <Particles />

      {/* ===== TOP NAVIGATION ===== */}
      <nav className={`top-bar ${scrollY > 50 ? 'top-bar--scrolled' : ''}`}>
        <div className="top-bar-inner">
          <span className="logo-text">$UPTREND</span>
          <div className="top-bar-actions">
            <a
              href="https://x.com/Uptrend_sol"
              target="_blank"
              rel="noopener noreferrer"
              className="twitter-btn"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Twitter
            </a>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Copy CA
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== GREEN MARQUEE ===== */}
      <Marquee />

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-glow" />
        <div
          className="hero-image-wrap"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        >
          <img src={heroImage} alt="Uptrend" className="hero-image" />
        </div>
        <div className="hero-bottom">
          <div className="hero-buttons">
            <a href="#buy" className="btn-buy">
              <span className="btn-buy-text">BUY NOW</span>
              <span className="btn-buy-glow" />
            </a>
            <a href="#about" className="btn-chart">VIEW CHART</a>
          </div>
        </div>
      </section>

      {/* ===== CANDLESTICK CHART ===== */}
      <CandlestickChart />

      {/* ===== STATS TICKER ===== */}
      <section className="stats">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">MARKET CAP</span>
            <span className="stat-value">
              <AnimatedNumber target={4200000} prefix="$" />
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">HOLDERS</span>
            <span className="stat-value">
              <AnimatedNumber target={12847} />
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">24H VOLUME</span>
            <span className="stat-value">
              <AnimatedNumber target={890000} prefix="$" />
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">BURNED</span>
            <span className="stat-value">
              <AnimatedNumber target={42} suffix="%" />
            </span>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className="about" id="about">
        <div className="about-inner">
          <h2 className="section-title">WTF IS $UPTREND?</h2>
          <p className="about-text">
            $UPTREND isn't just a token — it's a movement. Born from the trenches of degen culture,
            forged in green candles, and destined for Valhalla. No roadmap needed when the only
            direction is <span className="highlight">UP</span>.
          </p>
          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3>DEFLATIONARY</h3>
              <p>Every transaction burns tokens. Supply goes down, your bag goes up.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>LP LOCKED</h3>
              <p>Liquidity locked forever. No rugs here — only rockets.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>COMMUNITY</h3>
              <p>Built by degens, for degens. Join the army.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW TO BUY ===== */}
      <section className="how-to-buy" id="buy">
        <h2 className="section-title">HOW TO BUY</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3>GET A WALLET</h3>
            <p>Download Phantom or your favorite Solana wallet</p>
          </div>
          <div className="step">
            <div className="step-number">02</div>
            <h3>GET SOL</h3>
            <p>Buy SOL from an exchange and send it to your wallet</p>
          </div>
          <div className="step">
            <div className="step-number">03</div>
            <h3>SWAP FOR $UPTREND</h3>
            <p>Go to Raydium, paste the CA, and swap your SOL</p>
          </div>
          <div className="step">
            <div className="step-number">04</div>
            <h3>HOLD & CHILL</h3>
            <p>Sit back, relax, and watch your portfolio go green</p>
          </div>
        </div>
      </section>

      {/* ===== BOTTOM MARQUEE ===== */}
      <Marquee />

      {/* ===== FOOTER ===== */}
      <footer className="footer">
        <span className="footer-logo">$UPTREND</span>
        <p>© 2026 $UPTREND — All rights reserved. NFA. DYOR.</p>
      </footer>
    </div>
  )
}

export default App
