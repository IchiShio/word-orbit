#!/usr/bin/env python3
"""Generate orbit data for English words using Claude API."""

import asyncio
import json
import os
import sys
import time
from pathlib import Path
import urllib.request
import anthropic

# Config
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "data" / "words"
INDEX_FILE = Path(__file__).parent.parent / "public" / "data" / "index.json"
MODEL = "claude-haiku-4-5-20251001"

# 100-word target list (morpheme-rich, CEFR B1-C2)
TARGET_WORDS = [
    # dict- (to say)
    "predict", "dictate", "verdict", "dictionary", "contradict", "indicate",
    "edict", "diction", "benediction",
    # port- (to carry)
    "transport", "export", "import", "report", "support", "portable",
    "deport", "airport",
    # struct- (to build)
    "construct", "destruct", "instruct", "obstruct", "structure",
    "reconstruct", "infrastructure",
    # graph/gram- (to write)
    "biography", "autograph", "photograph", "telegraph", "geography",
    "graphic", "paragraph", "diagram",
    # bio- (life)
    "biology", "biopsy", "biome", "biodiversity", "antibiotic", "biosphere",
    # vis/vid- (to see)
    "invisible", "vision", "visible", "visual", "supervise", "visit",
    "video", "evidence", "television",
    # spect- (to look)
    "inspect", "respect", "spectator", "perspective", "expect", "spectacle",
    # ject- (to throw)
    "reject", "project", "inject", "eject", "subject", "object",
    # duc/duct- (to lead)
    "educate", "produce", "conduct", "reduce", "introduce", "deduce",
    # script/scrib- (to write)
    "describe", "prescribe", "subscribe", "manuscript", "inscription",
    # mit/mis- (to send)
    "transmit", "permit", "commit", "submit", "mission", "admit",
    # pos/pon- (to place)
    "compose", "expose", "propose", "impose", "position",
]


def fetch_dictionary(word: str) -> dict:
    """Fetch IPA and definition from Free Dictionary API."""
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    try:
        with urllib.request.urlopen(url, timeout=5) as r:
            data = json.loads(r.read())[0]
        ipa = ""
        for ph in data.get("phonetics", []):
            if ph.get("text"):
                ipa = ph["text"]
                break
        definition = ""
        pos = ""
        for meaning in data.get("meanings", []):
            if not pos:
                pos = meaning.get("partOfSpeech", "")
            for defn in meaning.get("definitions", []):
                if defn.get("definition"):
                    definition = defn["definition"]
                    break
            if definition:
                break
        return {"ipa": ipa, "pos": pos, "definition": definition}
    except Exception as e:
        print(f"  [dict] {word}: {e}")
        return {"ipa": "", "pos": "", "definition": ""}


def generate_orbit_data(client: anthropic.Anthropic, word: str, dict_data: dict) -> dict | None:
    """Call Claude to generate morpheme breakdown and orbit words."""
    prompt = f"""Analyze the English word "{word}" and return a JSON object with its morpheme structure and related words.

Word info:
- IPA: {dict_data['ipa']}
- POS: {dict_data['pos']}
- Definition: {dict_data['definition']}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{{
  "etymology": "brief etymology in English (e.g. 'Latin X: prefix- (meaning) + root (meaning)')",
  "parts": [
    {{"t": "prefix-", "type": "prefix", "m": "meaning"}},
    {{"t": "root", "type": "root", "m": "meaning"}},
    {{"t": "-suffix", "type": "suffix", "m": "meaning"}}
  ],
  "orbits": {{
    "root": [
      {{"w": "word", "h": "brief hint (2-4 words)", "orbitable": true}},
      ...
    ],
    "prefix": [
      {{"w": "word", "h": "brief hint", "orbitable": false}},
      ...
    ],
    "suffix": [
      {{"w": "word", "h": "brief hint", "orbitable": false}},
      ...
    ]
  }}
}}

Rules:
- parts: list only the actual morphemes present (1-3 items). If no prefix, omit it. If no suffix, omit it.
- orbits.root: 4-6 common English words sharing the SAME root morpheme. Set orbitable=true for frequent/important words.
- orbits.prefix: 3-5 words sharing the SAME prefix (if any). Set orbitable=false.
- orbits.suffix: 2-4 words sharing the SAME suffix (if any). Set orbitable=false.
- If no prefix/suffix in this word, set those orbit arrays to [].
- hints must be 2-4 words max, capturing the morpheme meaning.
- Only use real, common English words that most intermediate learners would know.
"""

    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        text = msg.content[0].text.strip()
        # Strip markdown code blocks if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"  [claude] {word}: {e}")
        return None


def save_word(word: str, dict_data: dict, orbit_data: dict):
    """Save word data to JSON file."""
    data = {
        "word": word,
        "ipa": dict_data["ipa"],
        "pos": dict_data["pos"],
        "definition": dict_data["definition"],
        "etymology": orbit_data.get("etymology", ""),
        "parts": orbit_data.get("parts", []),
        "orbits": {
            "root": orbit_data.get("orbits", {}).get("root", []),
            "prefix": orbit_data.get("orbits", {}).get("prefix", []),
            "suffix": orbit_data.get("orbits", {}).get("suffix", []),
        },
        "frequency": 0.7,
        "source": "claude-api",
        "reviewed": False,
    }
    output_path = OUTPUT_DIR / f"{word}.json"
    with open(output_path, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  saved {word}.json")


def update_index(words: list[str]):
    """Update index.json with all available words."""
    existing = []
    if INDEX_FILE.exists():
        with open(INDEX_FILE) as f:
            d = json.load(f)
            existing = d.get("words", [])
    all_words = sorted(set(existing + words))
    with open(INDEX_FILE, "w") as f:
        json.dump({"words": all_words, "total": len(all_words)}, f, indent=2)
    print(f"\nIndex updated: {len(all_words)} words total")


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set in environment")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Determine which words to process
    words_to_process = sys.argv[1:] if len(sys.argv) > 1 else TARGET_WORDS

    # Skip already-processed words
    words_to_process = [
        w for w in words_to_process
        if not (OUTPUT_DIR / f"{w}.json").exists()
    ]

    if not words_to_process:
        print("All words already processed.")
        return

    print(f"Processing {len(words_to_process)} words...\n")
    processed = []

    for i, word in enumerate(words_to_process, 1):
        print(f"[{i}/{len(words_to_process)}] {word}")
        dict_data = fetch_dictionary(word)
        if not dict_data["definition"]:
            print(f"  [skip] no definition found")
            continue
        orbit_data = generate_orbit_data(client, word, dict_data)
        if not orbit_data:
            print(f"  [skip] claude returned no data")
            continue
        save_word(word, dict_data, orbit_data)
        processed.append(word)
        if i < len(words_to_process):
            time.sleep(0.5)  # Rate limit

    update_index(processed)
    print(f"\nDone! Processed {len(processed)} words.")


if __name__ == "__main__":
    main()
