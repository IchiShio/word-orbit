'use client'
import { useState, useEffect } from 'react'
import type { WordData, OrbitWord, Part } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface Props {
  data: WordData
  selectedNode: OrbitWord | null
  onSpeak: (word: string) => void
}

const TYPE_COLOR: Record<string, string> = {
  root: '#e45852',
  prefix: '#3ac4ba',
  suffix: '#9476f0',
}

function MiniMorpheme({ parts }: { parts: Part[] }) {
  if (!parts.length) return null
  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
      {parts.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: TYPE_COLOR[p.type], opacity: 0.5, fontFamily: 'var(--font-ibm-plex-mono)' }}>{p.type}</span>
          <span style={{ fontSize: 13, color: TYPE_COLOR[p.type], fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 500 }}>{p.t}</span>
          <span style={{ fontSize: 11, color: 'rgba(173,169,160,0.75)', fontFamily: 'var(--font-ibm-plex-mono)' }}>{p.m}</span>
        </div>
      ))}
    </div>
  )
}

export default function InfoPanel({ data, selectedNode, onSpeak }: Props) {
  const router = useRouter()
  const [nodeParts, setNodeParts] = useState<Part[]>([])

  useEffect(() => {
    if (!selectedNode) { setNodeParts([]); return }
    fetch(`/data/words/${selectedNode.w}.json`)
      .then(r => r.ok ? r.json() : null)
      .then((d: WordData | null) => setNodeParts(d?.parts ?? []))
      .catch(() => setNodeParts([]))
  }, [selectedNode?.w])

  return (
    <div style={{ textAlign: 'right' }}>
      {/* Main word */}
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 300, color: '#efd64c', lineHeight: 1 }}>
        {data.word}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 3 }}>
        <span style={{ fontSize: 11, color: 'rgba(173,169,160,0.6)', fontFamily: "'IBM Plex Mono', monospace" }}>{data.ipa}</span>
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
          <div style={{ fontSize: 11, color: '#ada9a0', opacity: 0.75, lineHeight: 1.4, marginTop: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
            {selectedNode.h}
          </div>
          <MiniMorpheme parts={nodeParts} />
          {selectedNode.orbitable && (
            <span
              onClick={() => router.push(`/orbit/${selectedNode.w}`)}
              style={{ fontSize: 11, color: '#efd64c', cursor: 'pointer', marginTop: 8, display: 'inline-block', borderBottom: '1px dashed rgba(239,214,76,0.3)', paddingBottom: 1 }}
            >
              → orbit this word
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, fontSize: 7, color: 'rgba(173,169,160,0.5)', letterSpacing: 1, marginTop: 6, justifyContent: 'flex-end', fontFamily: "'IBM Plex Mono', monospace" }}>
        <span><i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#e4585d', marginRight: 3, verticalAlign: 'middle' }} />ROOT</span>
        <span><i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#3ac4ba', marginRight: 3, verticalAlign: 'middle' }} />PREFIX</span>
        <span><i style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#9476f0', marginRight: 3, verticalAlign: 'middle' }} />SUFFIX</span>
      </div>
    </div>
  )
}
