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
          flex-direction: column;
        }
        .orbit-canvas-wrap {
          position: relative;
          flex: 1;
        }
        /* Desktop overlays */
        .overlay-info {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 10;
          max-width: 260px;
        }
        .overlay-morpheme {
          position: absolute;
          bottom: 48px;
          left: 20px;
          z-index: 10;
        }
        .overlay-etymology {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          font-family: var(--font-ibm-plex-mono);
          font-size: 9px;
          color: rgba(173,169,160,0.4);
          letter-spacing: 0.5px;
          text-align: center;
          max-width: 400px;
          z-index: 10;
          white-space: nowrap;
        }
        /* Mobile bottom panel (hidden on desktop) */
        .mobile-panel {
          display: none;
        }
        @media (max-width: 640px) {
          .orbit-canvas-wrap {
            flex: none;
            height: 58dvh;
          }
          .overlay-info,
          .overlay-morpheme,
          .overlay-etymology {
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

          {/* Desktop overlays */}
          <div className="overlay-info">
            <InfoPanel data={data} selectedNode={selectedNode} nodeParts={nodeParts} onSpeak={speak} />
          </div>
          <div className="overlay-morpheme">
            <MorphemeEquation parts={data.parts} />
          </div>
          <div className="overlay-etymology">
            {data.etymology}
          </div>
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
