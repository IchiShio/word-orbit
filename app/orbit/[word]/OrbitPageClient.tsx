'use client'
import { useState } from 'react'
import OrbitCanvas from '@/components/OrbitCanvas'
import InfoPanel from '@/components/InfoPanel'
import MorphemeEquation from '@/components/MorphemeEquation'
import type { WordData, OrbitWord } from '@/lib/types'

export default function OrbitPageClient({ data }: { data: WordData }) {
  const [selectedNode, setSelectedNode] = useState<OrbitWord | null>(null)

  function speak(w: string) {
    const audio = new Audio(`/audio/${w}.mp3`)
    audio.play().catch(() => {
      const u = new SpeechSynthesisUtterance(w)
      u.lang = 'en-US'
      speechSynthesis.speak(u)
    })
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0e0d13' }}>
      <OrbitCanvas data={data} onSelectNode={setSelectedNode} />

      {/* Info panel top-right */}
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10, maxWidth: 260 }}>
        <InfoPanel data={data} selectedNode={selectedNode} onSpeak={speak} />
      </div>

      {/* Morpheme equation bottom-left */}
      <div style={{ position: 'absolute', bottom: 48, left: 20, zIndex: 10 }}>
        <MorphemeEquation parts={data.parts} />
      </div>

      {/* Etymology bottom-center */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-ibm-plex-mono)', fontSize: 9, color: 'rgba(173,169,160,0.4)',
        letterSpacing: 0.5, textAlign: 'center', maxWidth: 400, zIndex: 10, whiteSpace: 'nowrap',
      }}>
        {data.etymology}
      </div>
    </div>
  )
}
