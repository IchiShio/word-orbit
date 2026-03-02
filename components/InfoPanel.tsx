'use client'
import type { WordData, OrbitWord, Part } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { TYPE_COLORS } from '@/lib/colors'

interface Props {
  data: WordData
  selectedNode: OrbitWord | null
  nodeParts: Part[]
  onSpeak: (word: string) => void
  desktop?: boolean
}

const TYPE_COLOR: Record<string, string> = TYPE_COLORS

function MiniMorpheme({ parts, desktop }: { parts: Part[], desktop?: boolean }) {
  if (!parts.length) return null
  return (
    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: desktop ? 7 : 5, alignItems: desktop ? 'flex-start' : 'flex-end' }}>
      {parts.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: desktop ? 9 : 8, letterSpacing: 1, textTransform: 'uppercase', color: TYPE_COLOR[p.type], opacity: 0.5, fontFamily: 'var(--font-ibm-plex-mono)' }}>{p.type}</span>
          <span style={{ fontSize: desktop ? 15 : 13, color: TYPE_COLOR[p.type], fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 500 }}>{p.t}</span>
          <span style={{ fontSize: desktop ? 13 : 11, color: 'rgba(173,169,160,0.75)', fontFamily: 'var(--font-ibm-plex-mono)' }}>{p.m}</span>
        </div>
      ))}
    </div>
  )
}

export default function InfoPanel({ data, selectedNode, nodeParts, onSpeak, desktop }: Props) {
  const router = useRouter()

  return (
    <div style={{ textAlign: desktop ? 'left' : 'right' }}>
      {/* Main word */}
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: desktop ? 48 : 30, fontWeight: 300, color: '#efd64c', lineHeight: 1 }}>
        {data.word}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: desktop ? 'flex-start' : 'flex-end', marginTop: 5 }}>
        <span style={{ fontSize: desktop ? 14 : 11, color: 'rgba(173,169,160,0.6)', fontFamily: "'IBM Plex Mono', monospace" }}>{data.ipa}</span>
        <button
          onClick={() => onSpeak(data.word)}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.06)', color: '#efd64c', width: desktop ? 26 : 22, height: desktop ? 26 : 22, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: desktop ? 13 : 11 }}
        >
          🔊
        </button>
      </div>
      <div style={{ fontSize: desktop ? 10 : 7, letterSpacing: 2, textTransform: 'uppercase', color: '#3ac4ba', marginTop: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
        {data.pos}
      </div>
      <div style={{ fontSize: desktop ? 13 : 10, color: '#ada9a0', opacity: 0.7, lineHeight: 1.5, marginTop: 5, maxWidth: desktop ? 280 : 230, marginLeft: desktop ? 0 : 'auto', fontFamily: "'IBM Plex Mono', monospace" }}>
        {data.definition}
      </div>

      {/* Selected node panel */}
      {selectedNode && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: desktop ? 'flex-start' : 'flex-end' }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: desktop ? 26 : 18, fontWeight: 300, color: '#ada9a0', lineHeight: 1 }}>
              {selectedNode.w}
            </span>
            <button
              onClick={() => onSpeak(selectedNode.w)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.04)', color: '#efd64c', width: desktop ? 22 : 18, height: desktop ? 22 : 18, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: desktop ? 11 : 9 }}
            >
              🔊
            </button>
          </div>
          <div style={{ fontSize: desktop ? 12 : 11, color: '#ada9a0', opacity: 0.75, lineHeight: 1.5, marginTop: 5, fontFamily: "'IBM Plex Mono', monospace" }}>
            {selectedNode.h}
          </div>
          <MiniMorpheme parts={nodeParts} desktop={desktop} />
          {selectedNode.orbitable && (
            <span
              onClick={() => router.push(`/orbit/${selectedNode.w}`)}
              style={{ fontSize: desktop ? 12 : 11, color: '#efd64c', cursor: 'pointer', marginTop: 10, display: 'inline-block', borderBottom: '1px dashed rgba(239,214,76,0.3)', paddingBottom: 1 }}
            >
              → orbit this word
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, fontSize: desktop ? 9 : 7, color: 'rgba(173,169,160,0.5)', letterSpacing: 1, marginTop: 10, justifyContent: desktop ? 'flex-start' : 'flex-end', fontFamily: "'IBM Plex Mono', monospace" }}>
        <span><i style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: TYPE_COLORS.root, marginRight: 4, verticalAlign: 'middle' }} />ROOT</span>
        <span><i style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: TYPE_COLORS.prefix, marginRight: 4, verticalAlign: 'middle' }} />PREFIX</span>
        <span><i style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: TYPE_COLORS.suffix, marginRight: 4, verticalAlign: 'middle' }} />SUFFIX</span>
      </div>
    </div>
  )
}
