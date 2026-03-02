'use client'
import type { Part } from '@/lib/types'
import { TYPE_COLORS } from '@/lib/colors'

interface Props {
  parts: Part[]
}

export default function MorphemeEquation({ parts }: Props) {
  return (
    <div className="flex items-center flex-wrap gap-0">
      {parts.map((p, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: 'rgba(173,169,160,0.35)', padding: '0 3px', fontWeight: 300 }}>
              +
            </span>
          )}
          <div style={{
            backgroundColor: `${TYPE_COLORS[p.type]}14`,
            border: `1px solid ${TYPE_COLORS[p.type]}30`,
            textAlign: 'center',
            padding: '5px 12px',
            borderRadius: 5,
          }}>
            <div style={{ fontSize: 7, letterSpacing: 2, textTransform: 'uppercase', color: TYPE_COLORS[p.type], opacity: 0.7, marginBottom: 2, fontFamily: "'IBM Plex Mono', monospace" }}>{p.type}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TYPE_COLORS[p.type], fontFamily: "'IBM Plex Mono', monospace" }}>{p.t}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: '#c8c5bc' }}>{p.m}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
