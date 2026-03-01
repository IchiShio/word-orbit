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
    for attempt in range(3):
        try:
            tts = edge_tts.Communicate(word, VOICE)
            await tts.save(str(outfile))
            print(f"{word}.mp3")
            return
        except Exception as e:
            if attempt < 2:
                await asyncio.sleep(2 ** attempt)
            else:
                print(f"FAILED {word}: {e}")


async def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(INDEX_FILE) as f:
        index = json.load(f)
    words = [w for w in index.get("words", []) if not (OUTPUT_DIR / f"{w}.mp3").exists()]
    if not words:
        print("All audio already generated.")
        return
    print(f"Generating {len(words)} words...")
    sem = asyncio.Semaphore(2)
    async def limited(w):
        async with sem:
            await generate(w)
            await asyncio.sleep(0.5)
    await asyncio.gather(*[limited(w) for w in words])
    total = len(list(OUTPUT_DIR.glob("*.mp3")))
    print(f"\nDone! {total} audio files total.")


if __name__ == "__main__":
    asyncio.run(main())
