import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { getWordData } from '@/lib/data'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word: wordParam } = await params
  const data = await getWordData(wordParam)

  const word = data?.word ?? wordParam
  const parts = data?.parts ?? []
  const definition = data?.definition ?? ''
  const pos = data?.pos ?? ''

  const partColors: Record<string, string> = {
    root: '#e45852',
    prefix: '#3ac4ba',
    suffix: '#9476f0',
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#0e0d13',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Stars background dots */}
        <div style={{ position: 'absolute', top: 40, right: 60, width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 90, right: 200, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 80, right: 100, width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex' }} />

        {/* Word Orbit branding */}
        <div style={{ fontSize: 14, color: 'rgba(173,169,160,0.4)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 24, display: 'flex' }}>
          WORD ORBIT
        </div>

        {/* Main word */}
        <div style={{ fontSize: 80, fontWeight: 300, color: '#efd64c', lineHeight: 1, marginBottom: 16, display: 'flex' }}>
          {word}
        </div>

        {/* Parts equation */}
        {parts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {parts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {i > 0 && <span style={{ color: 'rgba(173,169,160,0.4)', fontSize: 20 }}>+</span>}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 16px',
                  borderRadius: 6,
                  background: `${partColors[p.type]}22`,
                  border: `1px solid ${partColors[p.type]}66`,
                }}>
                  <span style={{ fontSize: 22, color: partColors[p.type], fontWeight: 400 }}>{p.t}</span>
                  <span style={{ fontSize: 11, color: 'rgba(173,169,160,0.6)', marginTop: 2 }}>{p.m}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* POS + Definition */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
          {pos && (
            <span style={{ fontSize: 11, color: '#3ac4ba', letterSpacing: 2, textTransform: 'uppercase' }}>
              {pos}
            </span>
          )}
          <span style={{ fontSize: 18, color: 'rgba(173,169,160,0.7)', maxWidth: 700, lineHeight: 1.4, display: 'flex' }}>
            {definition.length > 100 ? definition.slice(0, 100) + '…' : definition}
          </span>
        </div>

        {/* native-real.com bottom right */}
        <div style={{
          position: 'absolute', bottom: 40, right: 60,
          fontSize: 12, color: 'rgba(173,169,160,0.3)', letterSpacing: 2,
          display: 'flex',
        }}>
          native-real.com/orbit
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
