import type { Metadata } from 'next'
import { Fraunces, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-fraunces',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
  title: 'Word Orbit — English Morpheme & Etymology Visualizer',
  description: 'Visualize English word roots, prefixes, and suffixes as orbiting planets. Explore morphemes and etymology interactively.',
  metadataBase: new URL('https://native-real.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${ibmPlexMono.variable}`} style={{ margin: 0, background: '#0e0d13', color: '#eee' }}>
        {children}
      </body>
    </html>
  )
}
