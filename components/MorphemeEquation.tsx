'use client'
import type { Part } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  root: '#e45852',
  prefix: '#3ac4ba',
  suffix: '#9476f0',
}
const TYPE_BG: Record<string, string> = {
  root: 'rgba(228,88,82,0.06)',
  prefix: 'rgba(58,196,186,0.06)',
  suffix: 'rgba(148,118,240,0.06)',
}

interface Props {
  parts: Part[]
}

export default function MorphemeEquation({ parts }: Props) {
  return (
    <div className="flex items-center flex-wrap gap-0">
      {parts.map((p, i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: '#2e2d3a', padding: '0 3px', fontWeight: 300 }}>
              +
            </span>
          )}
          <div
            style={{ backgroundColor: TYPE_BG[p.type], textAlign: 'center', padding: '5px 12px', borderRadius: 5 }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: '#ada9a0', fontFamily: "'IBM Plex Mono', monospace" }}>{p.t}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.1, color: TYPE_COLORS[p.type] }}>{p.m}</div>
            <div style={{ fontSize: 6, letterSpacing: 2, textTransform: 'uppercase', color: '#2e2d3a', marginTop: 2, fontFamily: "'IBM Plex Mono', monospace" }}>{p.type}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
