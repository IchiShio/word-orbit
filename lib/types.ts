export interface Part {
  t: string      // text (e.g. "pre-")
  type: 'prefix' | 'root' | 'suffix'
  m: string      // meaning (e.g. "before")
}

export interface OrbitWord {
  w: string      // word
  h: string      // hint
  orbitable: boolean
  ringType?: 'root' | 'prefix' | 'suffix'
}

export interface WordData {
  word: string
  ipa: string
  pos: string
  definition: string
  etymology: string
  parts: Part[]
  orbits: {
    root: OrbitWord[]
    prefix: OrbitWord[]
    suffix: OrbitWord[]
  }
  frequency: number
  source: string
  reviewed: boolean
}

export interface WordIndex {
  words: string[]
  total: number
}
