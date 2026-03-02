'use client'
import { useState, useEffect } from 'react'
import OrbitCanvas from '@/components/OrbitCanvas'
import InfoPanel from '@/components/InfoPanel'
import MorphemeEquation from '@/components/MorphemeEquation'
import type { WordData, OrbitWord, Part } from '@/lib/types'

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
          width: 360px;
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
          .orbit-root {
            flex-direction: column;
          }
          .orbit-canvas-wrap {
            flex: none;
            height: 58dvh;
          }
          .desktop-sidebar {
            display: none;
          }
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
          <OrbitCanvas data={data} onSelectNode={setSelectedNode} selParts={nodeParts} />
        </div>

        {/* Desktop sidebar */}
        <div className="desktop-sidebar">
          <InfoPanel data={data} selectedNode={selectedNode} nodeParts={nodeParts} onSpeak={speak} desktop />
          <MorphemeEquation parts={data.parts} />
          <div className="desktop-etymology">{data.etymology}</div>
        </div>

        {/* Mobile bottom panel */}
        <div className="mobile-panel">
          <InfoPanel data={data} selectedNode={selectedNode} nodeParts={nodeParts} onSpeak={speak} />
          <div style={{
            marginTop: 10,
            fontFamily: 'var(--font-ibm-plex-mono)',
            fontSize: 9,
            color: 'rgba(173,169,160,0.4)',
            letterSpacing: 0.5,
            lineHeight: 1.5,
          }}>
            {data.etymology}
          </div>
        </div>
      </div>
    </>
  )
}
