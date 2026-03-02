'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OrbitCanvas from '@/components/OrbitCanvas'
import InfoPanel from '@/components/InfoPanel'
import type { WordData, OrbitWord, Part } from '@/lib/types'
import { TYPE_COLORS } from '@/lib/colors'

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(14,13,19,0.92)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '16px 22px',
  minWidth: 240,
  maxWidth: 340,
  pointerEvents: 'auto',
}

const LEGEND = (['root','prefix','suffix'] as const).map(t => (
  <span key={t} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, letterSpacing: 1, color: 'rgba(173,169,160,0.45)' }}>
    <i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: TYPE_COLORS[t], marginRight: 4, verticalAlign: 'middle' }} />
    {t.toUpperCase()}
  </span>
))

function MorphemeRows({ parts }: { parts: Part[] }) {
  if (!parts.length) return null
  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
      {parts.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: TYPE_COLORS[p.type], opacity: 0.65, fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0, width: 42 }}>
            {p.type}
          </span>
          <span style={{ fontSize: 18, fontWeight: 600, color: TYPE_COLORS[p.type], fontFamily: "'IBM Plex Mono', monospace" }}>
            {p.t}
          </span>
          <span style={{ fontSize: 14, color: '#c8c5bc', fontFamily: "'IBM Plex Mono', monospace" }}>
            {p.m}
          </span>
        </div>
      ))}
    </div>
  )
}

/** メイン単語カード（左上固定） */
function MainCard({ data, onSpeak }: { data: WordData; onSpeak: (w: string) => void }) {
  return (
    <div style={{ ...CARD_STYLE, position: 'absolute', top: 24, left: 24, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 300, color: '#efd64c', lineHeight: 1 }}>
          {data.word}
        </span>
        <button onClick={() => onSpeak(data.word)}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#efd64c', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
          🔊
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
        <span style={{ fontSize: 12, color: 'rgba(173,169,160,0.6)', fontFamily: "'IBM Plex Mono', monospace" }}>{data.ipa}</span>
        <span style={{ fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', color: '#3ac4ba', fontFamily: "'IBM Plex Mono', monospace" }}>{data.pos}</span>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(173,169,160,0.65)', lineHeight: 1.5, marginTop: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
        {data.definition}
      </div>
      <MorphemeRows parts={data.parts} />
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 14 }}>
        {LEGEND}
      </div>
    </div>
  )
}

/** 選択ノードカード（右下固定） */
function NodeCard({ node, parts, onSpeak }: { node: OrbitWord; parts: Part[]; onSpeak: (w: string) => void }) {
  const router = useRouter()
  return (
    <div style={{
      ...CARD_STYLE,
      position: 'absolute', bottom: 24, right: 24, zIndex: 20,
      animation: 'popupIn 0.18s ease-out', animationFillMode: 'both',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 300, color: '#efd64c', lineHeight: 1 }}>
          {node.w}
        </span>
        <button onClick={() => onSpeak(node.w)}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#efd64c', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
          🔊
        </button>
      </div>
      {node.h && (
        <div style={{ fontSize: 12, color: 'rgba(173,169,160,0.65)', marginTop: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
          {node.h}
        </div>
      )}
      <MorphemeRows parts={parts} />
      <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 14 }}>
        {LEGEND}
      </div>
      {node.orbitable && (
        <div style={{ marginTop: 7 }}>
          <span onClick={() => router.push(`/orbit/${node.w}`)}
            style={{ fontSize: 11, color: '#efd64c', cursor: 'pointer', borderBottom: '1px dashed rgba(239,214,76,0.3)', paddingBottom: 1, fontFamily: "'IBM Plex Mono', monospace" }}>
            → orbit this word
          </span>
        </div>
      )}
    </div>
  )
}

export default function OrbitPageClient({ data }: { data: WordData }) {
  const [selectedNode, setSelectedNode] = useState<OrbitWord | null>(null)
  const [nodeParts, setNodeParts] = useState<Part[]>([])

  useEffect(() => {
    if (!selectedNode) { setNodeParts([]); return }
    fetch(`/data/words/${selectedNode.w}.json`)
      .then(r => r.ok ? r.json() : null)
      .then((d: WordData | null) => setNodeParts(d?.parts ?? []))
      .catch(() => setNodeParts([]))
  }, [selectedNode?.w])

  function speak(w: string) {
    const audio = new Audio(`/audio/${w}.mp3`)
    audio.play().catch(() => {
      const u = new SpeechSynthesisUtterance(w)
      u.lang = 'en-US'
      speechSynthesis.speak(u)
    })
  }

  return (
    <>
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .orbit-root {
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          background: #0e0d13;
        }
        .orbit-canvas-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }
        /* Desktop cards hidden on mobile */
        .desktop-card { display: block; }
        /* Mobile bottom panel (hidden on desktop) */
        .mobile-panel { display: none; }
        @media (max-width: 640px) {
          .orbit-root { display: flex; flex-direction: column; }
          .orbit-canvas-wrap { flex: none; height: 58dvh; }
          .desktop-card { display: none; }
          .mobile-panel {
            display: block;
            flex: 1;
            overflow-y: auto;
            padding: 12px 16px;
            border-top: 1px solid rgba(255,255,255,0.04);
          }
        }
      `}</style>

      <div className="orbit-root">
        <div className="orbit-canvas-wrap">
          <OrbitCanvas data={data} onSelectNode={setSelectedNode} />

          {/* Main word card — top-left (desktop only) */}
          <div className="desktop-card">
            <MainCard data={data} onSpeak={speak} />
          </div>

          {/* Selected node card — bottom-right (desktop only) */}
          {selectedNode && (
            <div className="desktop-card">
              <NodeCard key={selectedNode.w} node={selectedNode} parts={nodeParts} onSpeak={speak} />
            </div>
          )}
        </div>

        {/* Mobile bottom panel */}
        <div className="mobile-panel">
          <InfoPanel data={data} selectedNode={selectedNode} nodeParts={nodeParts} onSpeak={speak} />
          <div style={{ marginTop: 10, fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 9, color: 'rgba(173,169,160,0.4)', letterSpacing: 0.5, lineHeight: 1.5 }}>
            {data.etymology}
          </div>
        </div>
      </div>
    </>
  )
}
