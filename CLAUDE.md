# CLAUDE.md

## プロジェクト概要

Word Orbit — 英語語源・形態素マップビジュアライザー

- **URL**: https://native-real.com/orbit/ (Phase 1 GitHub Pages) → Vercel (Phase 2+)
- **技術スタック**: Next.js 16 App Router + TypeScript + Tailwind CSS + Canvas 2D
- **デプロイ**: Vercel（将来的にnative-real.comのメインドメインを移行予定）

## ディレクトリ構成

```
word-orbit/
├── app/
│   ├── page.tsx                    # Landing → /orbit/predict にリダイレクト
│   ├── orbit/[word]/
│   │   └── page.tsx                # SSG個別ページ
│   └── api/
│       └── og/[word]/route.tsx     # OGP画像生成
├── components/
│   ├── OrbitCanvas.tsx             # Canvas描画（useRef/useEffect）
│   ├── InfoPanel.tsx               # 右下パネル
│   └── MorphemeEquation.tsx        # 形態素分解表示
├── lib/
│   ├── types.ts                    # TypeScript型定義
│   └── data.ts                     # データ読み込み
├── public/
│   ├── data/
│   │   ├── index.json              # 全単語リスト
│   │   └── words/                  # 単語別JSONファイル
│   └── audio/                      # MP3ファイル（git管理外）
└── scripts/
    ├── generate_orbits.py          # Claude API → orbit data生成
    └── generate_audio.py           # Edge TTS → MP3生成
```

## 開発ルール

- コード変更後は自動でコミット＆プッシュまで行う
- APIキーは `.env.local` に記載し、ソースコードに直接書かない
- 単語データ追加: `python3 scripts/generate_orbits.py [word1 word2 ...]`
- 音声生成: `python3 scripts/generate_audio.py`（edge-tts要インストール）

## データフォーマット

各単語 `/public/data/words/{word}.json`:
- `parts[]`: 形態素分解（prefix/root/suffix）
- `orbits.root[]`: 同じrootを持つ関連語
- `orbits.prefix[]`: 同じprefixを持つ関連語
- `orbits.suffix[]`: 同じsuffixを持つ関連語
- `orbitable`: trueの単語はクリックして軌道展開可能
