'use client'
import { useRef, useEffect, useCallback } from 'react'
import type { WordData, OrbitWord } from '@/lib/types'

const OC = ['#e4585d', '#3ac4ba', '#9476f0']
const TYPES = ['root', 'prefix', 'suffix'] as const

interface CanvasNode {
  word: string
  hint: string
  ring: number
  idx: number
  cnt: number
  angle: number
  x: number
  y: number
  col: string
  op: number
  born: number
  delay: number
  orbitable: boolean
}

interface CanvasState {
  cur: string
  hov: string | null
  selW: string | null
  selRing: number | null
  nodes: CanvasNode[]
  fading: CanvasNode[]
  rings: [number, number, number]
  ringT: [number, number, number]
  t: number
  sunSc: number
  stars: Array<{ x: number; y: number; s: number; b: number; sp: number }>
  CWD: WordData | null
}

interface Props {
  data: WordData
  onSelectNode: (node: OrbitWord | null) => void
}

export default function OrbitCanvas({ data, onSelectNode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<CanvasState>({
    cur: data.word,
    hov: null,
    selW: null,
    selRing: null,
    nodes: [],
    fading: [],
    rings: [0, 0, 0],
    ringT: [0, 0, 0],
    t: 0,
    sunSc: 1,
    stars: [],
    CWD: data,
  })
  const rafRef = useRef<number>(0)
  const ltRef = useRef<number>(0)
  const CWRef = useRef<number>(0)
  const CHRef = useRef<number>(0)
  const CXRef = useRef<number>(0)
  const CYRef = useRef<number>(0)
  const dprRef = useRef<number>(1)

  const updRT = useCallback(() => {
    const b = Math.min(CWRef.current * 0.44, CHRef.current * 0.40)
    stateRef.current.ringT = [b * 0.36, b * 0.62, b * 0.86]
  }, [])

  const resize = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    // Fill parent container, not the full viewport
    const w = cv.offsetWidth
    const h = cv.offsetHeight
    CWRef.current = w
    CHRef.current = h
    cv.width = w * dpr
    cv.height = h * dpr
    const ctx = cv.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    CXRef.current = w / 2
    CYRef.current = h * 0.45
    updRT()
  }, [updRT])

  const initStars = useCallback(() => {
    stateRef.current.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * 2,
      y: Math.random() * 2,
      s: Math.random() * 0.7 + 0.3,
      b: Math.random() * 0.25 + 0.06,
      sp: Math.random() * 0.4 + 0.4,
    }))
  }, [])

  const drawStars = useCallback((ctx: CanvasRenderingContext2D) => {
    const t = stateRef.current.t * 0.0002
    stateRef.current.stars.forEach(s => {
      ctx.globalAlpha = s.b * (0.4 + 0.6 * Math.sin(t * s.sp * 3 + s.x * 70 + s.y * 50))
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(s.x * CWRef.current, s.y * CHRef.current, s.s, 0, 6.283)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }, [])

  const drawRings = useCallback((ctx: CanvasRenderingContext2D) => {
    const wd = stateRef.current.CWD
    const selRing = stateRef.current.selRing
    if (!wd) return
    const CX = CXRef.current, CY = CYRef.current
    for (let i = 0; i < 3; i++) {
      const r = stateRef.current.rings[i]
      if (r < 3) continue
      const isFocused = selRing === null || i === selRing
      const dim = isFocused ? 1 : 0.15
      const orbitKey = TYPES[i]
      const has = wd.orbits[orbitKey] && wd.orbits[orbitKey].length > 0
      ctx.strokeStyle = OC[i]
      ctx.globalAlpha = has ? 0.12 * dim : 0.02 * dim
      ctx.lineWidth = isFocused ? 1 : 0.5
      ctx.setLineDash([3, 6])
      ctx.beginPath()
      ctx.arc(CX, CY, r, 0, 6.283)
      ctx.stroke()
      ctx.setLineDash([])
      if (has) {
        const pt = wd.parts.find(p => p.type === TYPES[i])
        if (pt) {
          const label = `${pt.type.toUpperCase()} · ${pt.t}`
          ctx.font = '600 10px "IBM Plex Mono"'
          const textW = ctx.measureText(label).width
          const pillW = textW + 16
          const pillH = 16
          const pillX = CX - pillW / 2
          const pillY = CY - r - 8 - pillH
          const radius = 8

          // Draw pill background
          ctx.globalAlpha = 0.15 * dim
          ctx.fillStyle = OC[i]
          ctx.beginPath()
          ctx.moveTo(pillX + radius, pillY)
          ctx.lineTo(pillX + pillW - radius, pillY)
          ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, radius)
          ctx.lineTo(pillX + pillW, pillY + pillH - radius)
          ctx.arcTo(pillX + pillW, pillY + pillH, pillX + pillW - radius, pillY + pillH, radius)
          ctx.lineTo(pillX + radius, pillY + pillH)
          ctx.arcTo(pillX, pillY + pillH, pillX, pillY + pillH - radius, radius)
          ctx.lineTo(pillX, pillY + radius)
          ctx.arcTo(pillX, pillY, pillX + radius, pillY, radius)
          ctx.closePath()
          ctx.fill()

          // Draw pill stroke
          ctx.globalAlpha = 0.35 * dim
          ctx.strokeStyle = OC[i]
          ctx.lineWidth = 0.75
          ctx.stroke()

          // Draw label text inside pill
          ctx.globalAlpha = 0.8 * dim
          ctx.fillStyle = OC[i]
          ctx.textAlign = 'center'
          ctx.fillText(label, CX, pillY + pillH - 4)
        }
      }
    }
    ctx.globalAlpha = 1
  }, [])

  const drawSun = useCallback((ctx: CanvasRenderingContext2D) => {
    const CX = CXRef.current, CY = CYRef.current
    const sc = stateRef.current.sunSc
    const wd = stateRef.current.CWD
    const gl = ctx.createRadialGradient(CX, CY, 0, CX, CY, 55 * sc)
    gl.addColorStop(0, 'rgba(239,214,76,0.09)')
    gl.addColorStop(0.5, 'rgba(239,214,76,0.02)')
    gl.addColorStop(1, 'transparent')
    ctx.fillStyle = gl
    ctx.beginPath()
    ctx.arc(CX, CY, 55 * sc, 0, 6.283)
    ctx.fill()
    const co = ctx.createRadialGradient(CX, CY, 0, CX, CY, 7 * sc)
    co.addColorStop(0, '#fffef0')
    co.addColorStop(0.3, '#efd64c')
    co.addColorStop(1, 'rgba(239,214,76,0)')
    ctx.fillStyle = co
    ctx.beginPath()
    ctx.arc(CX, CY, 9 * sc, 0, 6.283)
    ctx.fill()
    ctx.globalAlpha = sc
    ctx.font = '300 20px "Fraunces"'
    ctx.fillStyle = '#efd64c'
    ctx.textAlign = 'center'
    ctx.fillText(stateRef.current.cur, CX, CY + 26 * sc)

    if (wd && wd.parts.length) {
      const parts = wd.parts
      const yNames = CY + 42 * sc
      const yMeans = CY + 55 * sc
      const sep = '  ·  '

      // Line 1: morpheme names, each colored by type
      ctx.font = '600 11px "IBM Plex Mono"'
      const sepW = ctx.measureText(sep).width
      let totalW = 0
      parts.forEach((p, i) => {
        if (i > 0) totalW += sepW
        totalW += ctx.measureText(p.t).width
      })
      let x = CX - totalW / 2
      ctx.textAlign = 'left'
      parts.forEach((p, i) => {
        if (i > 0) {
          ctx.globalAlpha = sc * 0.5
          ctx.fillStyle = '#ada9a0'
          ctx.fillText(sep, x, yNames)
          x += sepW
        }
        const ti = TYPES.indexOf(p.type as typeof TYPES[number])
        ctx.globalAlpha = sc
        ctx.fillStyle = ti >= 0 ? OC[ti] : '#ada9a0'
        ctx.fillText(p.t, x, yNames)
        x += ctx.measureText(p.t).width
      })

      // Line 2: meanings in grey, centered
      ctx.font = '400 10px "IBM Plex Mono"'
      ctx.globalAlpha = sc * 0.85
      ctx.fillStyle = '#c8c5bc'
      ctx.textAlign = 'center'
      ctx.fillText(parts.map(p => p.m).join('  ·  '), CX, yMeans)
    }
    ctx.globalAlpha = 1
  }, [])

  const drawConn = useCallback((ctx: CanvasRenderingContext2D, n: CanvasNode) => {
    const CX = CXRef.current, CY = CYRef.current
    const wd = stateRef.current.CWD
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = n.col
    ctx.lineWidth = 0.8
    ctx.setLineDash([1, 4])
    ctx.beginPath()
    ctx.moveTo(CX, CY)
    ctx.lineTo(n.x, n.y)
    ctx.stroke()
    ctx.setLineDash([])
    if (wd) {
      const pt = wd.parts.find(p => p.type === TYPES[n.ring])
      if (pt) {
        const mx = (CX + n.x * 2) / 3
        const my = (CY + n.y * 2) / 3
        ctx.globalAlpha = 0.7
        ctx.font = 'italic 300 11px "Fraunces"'
        ctx.fillStyle = n.col
        ctx.textAlign = 'center'
        ctx.fillText(pt.m, mx, my - 3)
        ctx.font = '400 8px "IBM Plex Mono"'
        ctx.globalAlpha = 0.5
        ctx.fillText(pt.t, mx, my + 9)
      }
    }
    ctx.restore()
  }, [])

  const drawNode = useCallback((ctx: CanvasRenderingContext2D, n: CanvasNode, fading: boolean) => {
    const S = stateRef.current
    const isH = S.hov === n.word
    const isS = S.selW === n.word
    const isFocused = fading || S.selRing === null || n.ring === S.selRing
    const dim = isFocused ? 1 : 0.2
    const a = n.op * (fading ? 0.35 : dim)
    if (a < 0.01) return

    if ((isH || isS) && !fading) drawConn(ctx, n)

    const f = 0.7
    const baseR = (6 + f * 6) * (isFocused ? 1 : 0.55)
    const r = baseR * (isH ? 1.25 : 1)

    ctx.globalAlpha = a
    const dg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r)
    dg.addColorStop(0, '#ffffff')
    dg.addColorStop(0.4, n.col)
    dg.addColorStop(1, n.col + '00')
    ctx.fillStyle = dg
    ctx.beginPath()
    ctx.arc(n.x, n.y, r, 0, 6.283)
    ctx.fill()

    if (isH || isS) {
      ctx.globalAlpha = 0.15 * a
      ctx.fillStyle = n.col
      ctx.beginPath()
      ctx.arc(n.x, n.y, 24, 0, 6.283)
      ctx.fill()
    }

    ctx.globalAlpha = a
    ctx.font = `700 ${isFocused ? 13 : 11}px "IBM Plex Mono"`
    ctx.fillStyle = isH || isS ? '#efd64c' : (isFocused ? '#f0ede8' : '#ada9a0')
    ctx.textAlign = 'center'
    ctx.fillText(n.word, n.x, n.y + r + 14)

    if (isFocused) {
      ctx.font = 'italic 300 10px "Fraunces"'
      ctx.globalAlpha = a * (isH ? 0.7 : 0.35)
      ctx.fillStyle = isH ? '#efd64c' : '#ada9a0'
      ctx.fillText(n.hint, n.x, n.y + r + 27)
    }
    ctx.globalAlpha = 1
  }, [drawConn])

  const update = useCallback((dt: number) => {
    const S = stateRef.current
    const CX = CXRef.current, CY = CYRef.current
    S.t += dt

    // Detect focused ring from selected word
    if (S.selW) {
      const sn = S.nodes.find(n => n.word === S.selW)
      S.selRing = sn !== undefined ? sn.ring : null
    } else {
      S.selRing = null
    }

    // Animate rings: expand focused ring, contract others
    for (let i = 0; i < 3; i++) {
      const tgt = S.selRing !== null
        ? (i === S.selRing ? S.ringT[i] * 1.5 : S.ringT[i] * 0.48)
        : S.ringT[i]
      S.rings[i] += (tgt - S.rings[i]) * 0.12
    }
    S.sunSc = 0.96 + 0.04 * Math.sin(S.t * 0.002)
    S.fading.forEach(n => { n.op = Math.max(0, n.op - dt * 0.012) })
    if (S.fading.length && S.fading.every(n => n.op <= 0)) S.fading = []

    const wd = S.CWD
    if (!wd) return

    if (S.nodes.length !== (wd.orbits.root.length + wd.orbits.prefix.length + wd.orbits.suffix.length)) {
      S.nodes = []
      const orbitArrays = [wd.orbits.root, wd.orbits.prefix, wd.orbits.suffix]
      orbitArrays.forEach((orb, ri) => {
        orb.forEach((item, i) => {
          S.nodes.push({
            word: item.w, hint: item.h, ring: ri, idx: i, cnt: orb.length,
            angle: -Math.PI / 2 + ri * 0.5 + (6.283 * i) / orb.length,
            x: CX, y: CY, col: OC[ri], op: 0, born: S.t,
            delay: ri * 60 + i * 40, orbitable: item.orbitable,
          })
        })
      })
    }

    const spd: [number, number, number] = [0.06, 0.04, 0.028]
    S.nodes.forEach(n => {
      n.angle += spd[n.ring] * dt * 0.001
      const r = S.rings[n.ring]
      n.x = CX + r * Math.cos(n.angle)
      n.y = CY + r * Math.sin(n.angle)
      const age = S.t - n.born
      if (age > n.delay) n.op = Math.min(1, n.op + dt * 0.015)
    })
  }, [])

  const nodeAt = useCallback((mx: number, my: number): CanvasNode | null => {
    let best: CanvasNode | null = null
    let bd = 999
    for (const n of stateRef.current.nodes) {
      const d = Math.hypot(n.x - mx, n.y - my)
      if (d < 36 && d < bd) { bd = d; best = n }
    }
    return best
  }, [])

  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')!

    const S = stateRef.current
    S.fading = S.nodes.map(n => ({ ...n }))
    S.nodes = []
    S.hov = null
    S.selW = null
    S.selRing = null
    S.rings = [0, 0, 0]
    S.cur = data.word
    S.CWD = data

    initStars()
    resize()

    const loop = (t: number) => {
      const dt = Math.min(t - ltRef.current, 50)
      ltRef.current = t
      update(dt)
      ctx.clearRect(0, 0, CWRef.current, CHRef.current)
      drawStars(ctx)
      drawRings(ctx)
      drawSun(ctx)
      S.fading.forEach(n => drawNode(ctx, n, true))
      S.nodes.forEach(n => drawNode(ctx, n, false))
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    // Use getBoundingClientRect to get canvas-relative coordinates
    const getPos = (clientX: number, clientY: number) => {
      const rect = cv.getBoundingClientRect()
      return { x: clientX - rect.left, y: clientY - rect.top }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { x, y } = getPos(e.clientX, e.clientY)
      const n = nodeAt(x, y)
      stateRef.current.hov = n ? n.word : null
      cv.style.cursor = n ? 'pointer' : 'default'
    }

    const handleClick = (e: MouseEvent) => {
      const { x, y } = getPos(e.clientX, e.clientY)
      const n = nodeAt(x, y)
      if (n) {
        stateRef.current.selW = n.word
        onSelectNode({ w: n.word, h: n.hint, orbitable: n.orbitable })
      }
    }

    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0]
      const { x, y } = getPos(touch.clientX, touch.clientY)
      const n = nodeAt(x, y)
      if (n) {
        e.preventDefault()
        stateRef.current.selW = n.word
        onSelectNode({ w: n.word, h: n.hint, orbitable: n.orbitable })
      }
    }

    const handleResize = () => resize()

    cv.addEventListener('mousemove', handleMouseMove)
    cv.addEventListener('click', handleClick)
    cv.addEventListener('touchstart', handleTouch, { passive: false })
    window.addEventListener('resize', handleResize)

    updRT()

    return () => {
      cancelAnimationFrame(rafRef.current)
      cv.removeEventListener('mousemove', handleMouseMove)
      cv.removeEventListener('click', handleClick)
      cv.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('resize', handleResize)
    }
  }, [data, initStars, resize, updRT, update, drawStars, drawRings, drawSun, drawNode, nodeAt, onSelectNode])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
