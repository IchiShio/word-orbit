import fs from 'fs'
import path from 'path'
import type { WordData, WordIndex } from './types'

const DATA_DIR = path.join(process.cwd(), 'public/data')

export async function getWordList(): Promise<string[]> {
  const indexPath = path.join(DATA_DIR, 'index.json')
  const raw = fs.readFileSync(indexPath, 'utf-8')
  const index: WordIndex = JSON.parse(raw)
  return index.words
}

export async function getWordData(word: string): Promise<WordData | null> {
  const filePath = path.join(DATA_DIR, 'words', `${word.toLowerCase()}.json`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as WordData
}

export function getWordDataSync(word: string): WordData | null {
  const filePath = path.join(DATA_DIR, 'words', `${word.toLowerCase()}.json`)
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}
