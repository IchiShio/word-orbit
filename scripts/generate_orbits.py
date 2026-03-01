#!/usr/bin/env python3
"""Generate orbit data for English words using Claude API."""

import json
import os
import sys
import time
from pathlib import Path
import anthropic

# .env.local を自動ロード
_env_file = Path(__file__).parent.parent / ".env.local"
if _env_file.exists():
    for _line in _env_file.read_text().splitlines():
        if _line.startswith("#") or "=" not in _line:
            continue
        _k, _v = _line.split("=", 1)
        os.environ.setdefault(_k.strip(), _v.strip())

# Config
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "data" / "words"
INDEX_FILE = Path(__file__).parent.parent / "public" / "data" / "index.json"
MODEL = "claude-haiku-4-5-20251001"

# 100-word target list (morpheme-rich, CEFR B1-C2)
TARGET_WORDS = [
    # dict- (to say)
    "verdict", "dictionary", "contradict", "indicate", "edict", "diction",
    # port- (to carry)
    "import", "report", "support", "portable", "deport", "airport",
    # struct- (to build)
    "destruct", "instruct", "obstruct", "structure", "reconstruct", "infrastructure",
    # graph/gram- (to write)
    "autograph", "photograph", "telegraph", "geography", "graphic", "paragraph", "diagram",
    # bio- (life)
    "biology", "biopsy", "biome", "biodiversity", "antibiotic", "biosphere",
    # vis/vid- (to see)
    "vision", "visible", "visual", "supervise", "visit", "video", "evidence", "television",
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

PROMPT_TEMPLATE = """Analyze the English word "{word}" and return a single JSON object.

Return ONLY valid JSON (no markdown, no explanation):
{{
  "ipa": "General American IPA (e.g. /pɹɪˈdɪkt/)",
  "pos": "part of speech (verb/noun/adjective/adverb)",
  "definition": "clear, concise definition in one sentence",
  "etymology": "brief etymology (e.g. 'Latin praedīcere: prae- (before) + dīcere (to say)')",
  "parts": [
    {{"t": "pre-", "type": "prefix", "m": "before"}},
    {{"t": "dict", "type": "root", "m": "to say, speak"}}
  ],
  "orbits": {{
    "root": [
      {{"w": "dictate", "h": "say aloud", "orbitable": true}},
      {{"w": "verdict", "h": "truth + say", "orbitable": false}}
    ],
    "prefix": [
      {{"w": "preview", "h": "see before", "orbitable": false}}
    ],
    "suffix": []
  }}
}}

Rules:
- parts: list only morphemes actually present (1-3 items). Omit prefix/suffix if absent.
- orbits.root: 4-6 common English words sharing the SAME root. orbitable=true for important words.
- orbits.prefix: 3-5 words sharing the SAME prefix (if present), else [].
- orbits.suffix: 2-4 words sharing the SAME suffix (if present), else [].
- hints (h): 2-4 words capturing meaning, e.g. "carry across", "say against".
- Only use real common English words that B1-C1 learners would know.
"""


def generate_word_data(client: anthropic.Anthropic, word: str) -> dict | None:
    """Call Claude to generate full word data including IPA, definition, and orbits."""
    try:
        msg = client.messages.create(
            model=MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": PROMPT_TEMPLATE.format(word=word)}]
        )
        text = msg.content[0].text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"  [claude] {word}: {e}")
        return None


def save_word(word: str, data: dict):
    """Save word data to JSON file."""
    output = {
        "word": word,
        "ipa": data.get("ipa", ""),
        "pos": data.get("pos", ""),
        "definition": data.get("definition", ""),
        "etymology": data.get("etymology", ""),
        "parts": data.get("parts", []),
        "orbits": {
            "root": data.get("orbits", {}).get("root", []),
            "prefix": data.get("orbits", {}).get("prefix", []),
            "suffix": data.get("orbits", {}).get("suffix", []),
        },
        "frequency": 0.7,
        "source": "claude-api",
        "reviewed": False,
    }
    output_path = OUTPUT_DIR / f"{word}.json"
    with open(output_path, "w") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
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
        json.dump({"words": all_words, "orbitable": all_words, "total": len(all_words)}, f, indent=2)
    print(f"\nIndex updated: {len(all_words)} words total")


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set in environment")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    words_to_process = sys.argv[1:] if len(sys.argv) > 1 else TARGET_WORDS
    words_to_process = [w for w in words_to_process if not (OUTPUT_DIR / f"{w}.json").exists()]

    if not words_to_process:
        print("All words already processed.")
        return

    print(f"Processing {len(words_to_process)} words...\n")
    processed = []

    for i, word in enumerate(words_to_process, 1):
        print(f"[{i}/{len(words_to_process)}] {word}")
        data = generate_word_data(client, word)
        if not data:
            print(f"  [skip] no data returned")
            continue
        save_word(word, data)
        processed.append(word)
        if i < len(words_to_process):
            time.sleep(0.3)

    update_index(processed)
    print(f"\nDone! Processed {len(processed)} words.")


if __name__ == "__main__":
    main()
