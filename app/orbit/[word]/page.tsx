import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getWordList, getWordData } from '@/lib/data'
import OrbitPageClient from './OrbitPageClient'

interface Props {
  params: Promise<{ word: string }>
}

export async function generateStaticParams() {
  const words = await getWordList()
  return words.map(w => ({ word: w }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { word } = await params
  const data = await getWordData(word)
  if (!data) return { title: 'Word Orbit' }

  const morphemes = data.parts.map(p => p.t).join(' + ')
  return {
    title: `${data.word} — Etymology & Morpheme Map | Word Orbit`,
    description: `Explore the morphemes of "${data.word}": ${morphemes}. ${data.definition}`,
    openGraph: {
      title: `${data.word} — Word Orbit`,
      description: data.etymology,
      images: [`/api/og/${data.word}`],
    },
    other: {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        name: data.word,
        description: data.definition,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          name: 'Word Orbit English Morpheme Dictionary',
        },
      }),
    },
  }
}

export default async function OrbitPage({ params }: Props) {
  const { word } = await params
  const data = await getWordData(word)
  if (!data) notFound()

  return <OrbitPageClient data={data} />
}
