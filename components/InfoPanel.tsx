'use client'
import type { WordData, OrbitWord } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface Props {
  data: WordData
  selectedNode: OrbitWord | null
  onSpeak: (word: string) => void
}

export default function InfoPanel({ data, selectedNode, onSpeak }: Props) {
  const router = useRouter()

  return (
    <div style={{ textAlign: 'right' }}>
      {/* Main word */}
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 300, color: '#efd64c', lineHeight: 1 }}>
        {data.word}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 3 }}>
        <span style={{ fontSize: 11, color: '#2e2d3a', fontFamily: "'IBM Plex Mono', monospace" }}>{data.ipa}</span>
        <button
          onClick={() => onSpeak(data.word)}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.04)', color: '#efd64c', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}
        >
          🔊
        </button>
      </div>
      <div style={{ fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: '#3ac4ba', marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
        {data.pos}
      </div>
      <div style={{ fontSize: 10, color: '#ada9a0', opacity: 0.6, lineHeight: 1.4, marginTop: 3, maxWidth: 230, marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace" }}>
        {data.definition}
      </div>

      {/* Selected node panel */}
      {selectedNode && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 300, color: '#ada9a0', lineHeight: 1 }}>
              {selectedNode.w}
            </span>
            <button
              onClick={() => onSpeak(selectedNode.w)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.04)', color: '#efd64c', width: 18, height: 18, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}
            >
              🔊
            </button>
          </div>
          <div style={{ fontSize: 9, color: '#ada9a0', opacity: 0.55, lineHeight: 1.3, marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>
            {selectedNode.h}
          </div>
          {selectedNode.orbitable && (
            <span
              onClick={() => router.push(`/orbit/${selectedNode.w}`)}
              style={{ fontSize: 9, color: '#efd64c', cursor: 'pointer', marginTop: 5, display: 'inline-block', borderBottom: '1px dashed rgba(239,214,76,0.2)' }}
            >
              → orbit this word
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, fontSize: 7, color: '#2e2d3a', letterSpacing: 1, marginTop: 6, justifyContent: 'flex-end', fontFamily: "'IBM Plex Mono', monospace" }}>
        <span><i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#e4585d', marginRight: 3, verticalAlign: 'middle' }} />ROOT</span>
        <span><i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#3ac4ba', marginRight: 3, verticalAlign: 'middle' }} />PREFIX</span>
        <span><i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#9476f0', marginRight: 3, verticalAlign: 'middle' }} />SUFFIX</span>
      </div>
    </div>
  )
}
