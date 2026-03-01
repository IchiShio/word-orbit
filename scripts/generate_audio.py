#!/usr/bin/env python3
"""Generate MP3 audio for all words using Edge TTS."""

import asyncio
import json
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "audio"
INDEX_FILE = Path(__file__).parent.parent / "public" / "data" / "index.json"
VOICE = "en-US-AndrewMultilingualNeural"


async def generate(word: str):
    try:
        import edge_tts
    except ImportError:
        print("Install edge-tts: pip install edge-tts")
        return
    outfile = OUTPUT_DIR / f"{word}.mp3"
    if outfile.exists():
        return
    tts = edge_tts.Communicate(word, VOICE)
    await tts.save(str(outfile))
    print(f"{word}.mp3")


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(INDEX_FILE) as f:
        index = json.load(f)
    words = index.get("words", [])
    sem = asyncio.Semaphore(5)
    async def limited(w):
        async with sem:
            await generate(w)
    await asyncio.gather(*[limited(w) for w in words])
    print(f"\nDone! Generated audio for {len(words)} words.")


if __name__ == "__main__":
    asyncio.run(main())
