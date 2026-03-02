'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OrbitCanvas from '@/components/OrbitCanvas'
import InfoPanel from '@/components/InfoPanel'
import MorphemeEquation from '@/components/MorphemeEquation'
import type { WordData, OrbitWord, Part } from '@/lib/types'
import { TYPE_COLORS } from '@/lib/colors'

function NodePopup({ node, parts, onSpeak }: { node: OrbitWord; parts: Part[]; onSpeak: (w: string) => void }) {
  const router = useRouter()
  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      right: '24px',
      zIndex: 20,
      background: 'rgba(14,13,19,0.92)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      padding: '18px 24px',
      minWidth: 260,
      maxWidth: 360,
      pointerEvents: 'auto',
      animation: 'popupIn 0.18s ease-out',
      animationFillMode: 'both',
    }}>
      {/* Word + speaker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 300, color: '#efd64c', lineHeight: 1 }}>
          {node.w}
        </span>
        <button
          onClick={() => onSpeak(node.w)}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: '#efd64c', width: 26, height: 26, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}
        >🔊</button>
      </div>

      {/* Hint */}
      {node.h && (
        <div style={{ fontSize: 12, color: 'rgba(173,169,160,0.65)', marginTop: 6, fontFamily: "'IBM Plex Mono', monospace" }}>
          {node.h}
        </div>
      )}

      {/* Morpheme rows */}
      {parts.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {parts.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 8, letterSpacing: 1.5, textTransform: 'uppercase', color: TYPE_COLORS[p.type], opacity: 0.65, fontFamily: "'IBM Plex Mono', monospace", flexShrink: 0, width: 40 }}>
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
      )}

      {/* Divider + legend */}
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 14, fontSize: 8, color: 'rgba(173,169,160,0.45)', letterSpacing: 1, fontFamily: "'IBM Plex Mono', monospace" }}>
        {(['root','prefix','suffix'] as const).map(t => (
          <span key={t}>
            <i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: TYPE_COLORS[t], marginRight: 4, verticalAlign: 'middle' }} />
            {t.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Orbit link */}
      {node.orbitable && (
        <div style={{ marginTop: 8 }}>
          <span
            onClick={() => router.push(`/orbit/${node.w}`)}
            style={{ fontSize: 11, color: '#efd64c', cursor: 'pointer', borderBottom: '1px dashed rgba(239,214,76,0.3)', paddingBottom: 1, fontFamily: "'IBM Plex Mono', monospace" }}
          >
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
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .orbit-root {
          position: relative;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          background: #0e0d13;
          display: flex;
          flex-direction: row;
        }
        .orbit-canvas-wrap {
          position: relative;
          flex: 1;
          min-width: 0;
        }
        /* Desktop sidebar */
        .desktop-sidebar {
          width: 320px;
          flex-shrink: 0;
          padding: 28px 24px;
          overflow-y: auto;
          border-left: 1px solid rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .desktop-etymology {
          font-family: var(--font-ibm-plex-mono);
          font-size: 10px;
          color: rgba(173,169,160,0.4);
          letter-spacing: 0.5px;
          line-height: 1.6;
        }
        /* Mobile bottom panel (hidden on desktop) */
        .mobile-panel {
          display: none;
        }
        @media (max-width: 640px) {
          .orbit-root { flex-direction: column; }
          .orbit-canvas-wrap { flex: none; height: 58dvh; }
          .desktop-sidebar { display: none; }
          .mobile-panel {
            display: block;
            height: 42dvh;
            overflow-y: auto;
            padding: 12px 16px;
            border-top: 1px solid rgba(255,255,255,0.04);
          }
        }
      `}</style>

      <div className="orbit-root">
        {/* Canvas area */}
        <div className="orbit-canvas-wrap">
          <OrbitCanvas data={data} onSelectNode={setSelectedNode} />

          {/* Node popup — appears above pinned node at bottom-center */}
          {selectedNode && (
            <NodePopup key={selectedNode.w} node={selectedNode} parts={nodeParts} onSpeak={speak} />
          )}
        </div>

        {/* Desktop sidebar — main word only */}
        <div className="desktop-sidebar">
          <InfoPanel data={data} selectedNode={null} nodeParts={[]} onSpeak={speak} desktop />
          <MorphemeEquation parts={data.parts} />
          <div className="desktop-etymology">{data.etymology}</div>
        </div>

        {/* Mobile bottom panel — main word + etymology */}
        <div className="mobile-panel">
          <InfoPanel data={data} selectedNode={null} nodeParts={[]} onSpeak={speak} />
          <div style={{ marginTop: 10, fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 9, color: 'rgba(173,169,160,0.4)', letterSpacing: 0.5, lineHeight: 1.5 }}>
            {data.etymology}
          </div>
        </div>
      </div>
    </>
  )
}
