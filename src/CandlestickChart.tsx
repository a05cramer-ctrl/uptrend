import { useRef, useEffect, useCallback } from 'react'

interface Candle {
  open: number
  close: number
  high: number
  low: number
}

// Generate a bullish candlestick dataset
function generateBullishCandles(count: number): Candle[] {
  const candles: Candle[] = []
  let price = 40

  for (let i = 0; i < count; i++) {
    const bullish = Math.random() > 0.28 // ~72% green candles
    const bodySize = 2 + Math.random() * 8
    const wickUp = 1 + Math.random() * 4
    const wickDown = 1 + Math.random() * 4
    // overall upward drift
    const drift = 0.6 + Math.random() * 1.5

    const open = price
    const close = bullish ? open + bodySize : open - bodySize * 0.6
    const high = Math.max(open, close) + wickUp
    const low = Math.min(open, close) - wickDown

    candles.push({ open, close, high, low })
    price = close + drift
  }

  return candles
}

const CANDLE_DATA = generateBullishCandles(40)

export default function CandlestickChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High-DPI support
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height
    const padding = { top: 30, bottom: 30, left: 20, right: 20 }
    const chartW = W - padding.left - padding.right
    const chartH = H - padding.top - padding.bottom

    // Find price range
    let minPrice = Infinity
    let maxPrice = -Infinity
    for (const c of CANDLE_DATA) {
      if (c.low < minPrice) minPrice = c.low
      if (c.high > maxPrice) maxPrice = c.high
    }
    const priceRange = maxPrice - minPrice || 1

    const candleCount = CANDLE_DATA.length
    const candleWidth = chartW / candleCount
    const bodyWidth = candleWidth * 0.55

    // Map price to Y
    const priceToY = (p: number) =>
      padding.top + chartH - ((p - minPrice) / priceRange) * chartH

    // Animation timing
    const now = performance.now()
    // Each candle takes 400ms to paint, staggered by 200ms
    const stagger = 180
    const paintDuration = 500
    // Total cycle: all candles + pause + fade out
    const totalPaint = stagger * (candleCount - 1) + paintDuration
    const pauseTime = 2500
    const fadeOutTime = 600
    const cycleTime = totalPaint + pauseTime + fadeOutTime
    const t = now % cycleTime

    // Global fade: fade out near end of cycle, fade in at start
    let globalAlpha = 1
    if (t > totalPaint + pauseTime) {
      // Fading out
      globalAlpha = 1 - (t - totalPaint - pauseTime) / fadeOutTime
    } else if (t < 300) {
      // Fading in
      globalAlpha = t / 300
    }
    globalAlpha = Math.max(0, Math.min(1, globalAlpha))

    // Clear
    ctx.clearRect(0, 0, W, H)

    // Draw subtle grid lines
    ctx.save()
    ctx.globalAlpha = 0.06 * globalAlpha
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 1
    const gridLines = 6
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartH / gridLines) * i
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(W - padding.right, y)
      ctx.stroke()
    }
    ctx.restore()

    // Draw each candle
    for (let i = 0; i < candleCount; i++) {
      const c = CANDLE_DATA[i]
      const bullish = c.close >= c.open
      const candleStart = stagger * i
      const elapsed = t - candleStart

      if (elapsed < 0) continue // Not started yet

      // Progress: 0 → 1 over paintDuration
      const progress = Math.min(1, elapsed / paintDuration)
      // Easing: ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3)

      const x = padding.left + candleWidth * i + candleWidth / 2

      const bodyTop = priceToY(Math.max(c.open, c.close))
      const bodyBottom = priceToY(Math.min(c.open, c.close))
      const wickTop = priceToY(c.high)
      const wickBottom = priceToY(c.low)

      const bodyHeight = bodyBottom - bodyTop
      const fullBodyLeft = x - bodyWidth / 2

      const color = bullish ? '#22c55e' : '#ef4444'
      const glowColor = bullish
        ? 'rgba(34, 197, 94, 0.5)'
        : 'rgba(239, 68, 68, 0.4)'
      const dimColor = bullish
        ? 'rgba(34, 197, 94, 0.25)'
        : 'rgba(239, 68, 68, 0.2)'

      ctx.save()
      ctx.globalAlpha = globalAlpha

      // Phase 1 (0-0.3): Wick draws from center outward
      // Phase 2 (0.2-0.7): Body grows from center
      // Phase 3 (0.5-1.0): Full color + glow

      // === WICK ===
      const wickProgress = Math.min(1, ease / 0.4)
      const bodyCenter = (bodyTop + bodyBottom) / 2

      if (wickProgress > 0) {
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = globalAlpha * Math.min(1, wickProgress * 1.5)

        // Upper wick grows upward from body center
        const currentWickTop =
          bodyCenter - (bodyCenter - wickTop) * wickProgress
        ctx.beginPath()
        ctx.moveTo(x, bodyCenter)
        ctx.lineTo(x, currentWickTop)
        ctx.stroke()

        // Lower wick grows downward from body center
        const currentWickBottom =
          bodyCenter + (wickBottom - bodyCenter) * wickProgress
        ctx.beginPath()
        ctx.moveTo(x, bodyCenter)
        ctx.lineTo(x, currentWickBottom)
        ctx.stroke()
      }

      // === BODY ===
      const bodyProgress = Math.max(0, Math.min(1, (ease - 0.15) / 0.5))
      if (bodyProgress > 0) {
        const currentHeight = bodyHeight * bodyProgress
        const currentTop = bodyCenter - currentHeight / 2
        const currentWidth = bodyWidth * bodyProgress

        // Glow
        const glowIntensity = Math.max(0, (ease - 0.4) / 0.6)
        if (glowIntensity > 0) {
          ctx.shadowColor = glowColor
          ctx.shadowBlur = 15 * glowIntensity
        }

        ctx.globalAlpha = globalAlpha * (0.5 + bodyProgress * 0.5)

        if (bullish) {
          // Filled green body
          ctx.fillStyle = color
          ctx.fillRect(
            x - currentWidth / 2,
            currentTop,
            currentWidth,
            currentHeight
          )
        } else {
          // Red body: filled
          ctx.fillStyle = color
          ctx.fillRect(
            x - currentWidth / 2,
            currentTop,
            currentWidth,
            currentHeight
          )
        }

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }

      // === Scanline glow effect while painting ===
      if (ease > 0.1 && ease < 0.85) {
        const scanY = bodyTop + bodyHeight * ((ease - 0.1) / 0.75)
        const grad = ctx.createRadialGradient(x, scanY, 0, x, scanY, bodyWidth)
        grad.addColorStop(0, bullish ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.3)')
        grad.addColorStop(1, 'transparent')
        ctx.globalAlpha = globalAlpha * (1 - Math.abs(ease - 0.5) * 2)
        ctx.fillStyle = grad
        ctx.fillRect(
          fullBodyLeft - 10,
          scanY - 10,
          bodyWidth + 20,
          20
        )
      }

      ctx.restore()
    }

    // Draw a trailing glow line connecting closes
    ctx.save()
    ctx.globalAlpha = 0.35 * globalAlpha
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 1.5
    ctx.shadowColor = 'rgba(34, 197, 94, 0.6)'
    ctx.shadowBlur = 10
    ctx.beginPath()
    let started = false
    for (let i = 0; i < candleCount; i++) {
      const elapsed = t - stagger * i
      if (elapsed < paintDuration * 0.5) break
      const x = padding.left + candleWidth * i + candleWidth / 2
      const y = priceToY(CANDLE_DATA[i].close)
      if (!started) {
        ctx.moveTo(x, y)
        started = true
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()
    ctx.restore()

    animRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      // Canvas redraws on next frame automatically
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <section className="candlestick-section">
      <h2 className="section-title">THE CHART SPEAKS</h2>
      <p className="candlestick-subtitle">NOTHING BUT GREEN CANDLES</p>
      <div className="candlestick-wrapper">
        <canvas ref={canvasRef} className="candlestick-canvas" />
        <div className="candlestick-reflection" />
      </div>
    </section>
  )
}
