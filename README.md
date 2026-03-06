<div align="center">
  <img src="./icons/icon-512x512.png" width="120" alt="Rika Lab Icon" />

  # 🌿 Rika Lab — 理科学習PWA

  **小学4〜6年生向け 理科クイズアプリ**
  四谷大塚カリキュラム準拠 × 31単元 × 162問

  ![PWA](https://img.shields.io/badge/PWA-Ready-34d399?style=flat-square&logo=pwa)
  ![HTML](https://img.shields.io/badge/HTML-Single%20File-0284c7?style=flat-square&logo=html5)
  ![License](https://img.shields.io/badge/License-MIT-db2777?style=flat-square)
  ![Grade](https://img.shields.io/badge/Grade-4〜6年生-f59e0b?style=flat-square)

  [🚀 デモを見る](#) · [📱 インストール方法](#インストール方法) · [📋 仕様書](#仕様)

</div>

---

## ✨ 特徴

- 📚 **31単元・162問** — 四谷大塚カリキュラム完全準拠
- 🎨 **ミント × エメラルドのライトテーマ** — 目に優しいデザイン
- 📱 **PWA対応** — ホーム画面に追加してネイティブアプリのように使える
- ✈️ **オフライン対応** — 一度読み込めばネットなしでも動作
- 🏆 **3段階難易度** — easy / normal / hard で実力に合わせて学習
- 📊 **進捗管理** — 単元ごとの学習状況を記録

---

## 🎓 対応単元

| 学年 | 色 | 単元数 | 問題数 |
|------|-----|--------|--------|
| 🟢 4年生 | エメラルド | 10単元 | 60問 |
| 🔵 5年生 | スカイブルー | 11単元 | 66問 |
| 🔴 6年生 | ホットピンク | 10単元 | 36問 |

<details>
<summary>全単元一覧</summary>

**4年生** — 植物の育ち方 / 動物のすみか / 人の体の仕組み / 天気と気温 / 季節と生き物 / 電気①② / ものの温度と体積 / 流れる水のはたらき / ばねのはたらき

**5年生** — 植物の発芽と成長 / 動物の誕生 / 人の体のつくり / 電流と電圧 / 光の性質 / 音の性質 / 力とてこ / 水よう液の性質 / 水の変化 / 天体の動き / 大地のつくり

**6年生** — 電気の利用 / 水よう液（発展）/ イオンと電解質 / 星と宇宙 / 天気の変化 / 地震と火山 / 生物の進化 / エネルギーと環境 / 物理・力学まとめ / 総合復習

</details>

---

## 🚀 使い方

### ブラウザで開く（最も簡単）

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/rika-lab.git
cd rika-lab

# index.html をブラウザで直接開く
open index.html
```

### GitHub Pages でデプロイ

1. このリポジトリを Fork または Clone
2. GitHub の Settings → Pages → Source を `main` ブランチの `/` (root) に設定
3. `https://YOUR_USERNAME.github.io/rika-lab/` でアクセス可能に！

### ローカルサーバー（PWA機能のフルテスト）

```bash
# Python の場合
python3 -m http.server 8080

# Node.js の場合
npx serve .

# ブラウザで http://localhost:8080 を開く
```

---

## 📱 インストール方法

### iPhone / iPad (Safari)
1. Safari で GitHub Pages の URL を開く
2. 下部の「共有」ボタン → 「ホーム画面に追加」
3. アイコンが出現！ ネイティブアプリのように起動できます

### Android (Chrome)
1. Chrome でページを開く
2. アドレスバー右の「⋮」→「アプリをインストール」
3. ホーム画面にアイコンが追加されます

### デスクトップ (Chrome / Edge)
1. アドレスバー右端の「📥」アイコンをクリック
2. 「インストール」を選択

---

## 🗂️ ファイル構成

```
rika-lab/
├── index.html          # メインアプリ（単一ファイルPWA）
├── manifest.json       # PWA マニフェスト
├── sw.js               # Service Worker（オフライン対応）
├── favicon.ico         # ファビコン（16/32/48px 複合）
├── icons/
│   ├── icon-master.svg         # SVGマスター
│   ├── icon-16x16.png
│   ├── icon-32x32.png
│   ├── icon-48x48.png
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── apple-touch-icon.png    # iOS ホーム画面用 (180x180)
│   ├── icon-192x192.png        # Android / Chrome
│   ├── icon-384x384.png
│   └── icon-512x512.png        # PWA スプラッシュ
└── README.md
```

---

## 🛠️ 技術仕様

| 項目 | 内容 |
|------|------|
| フロントエンド | HTML5 / CSS3 / Vanilla JavaScript |
| フォント | Noto Sans JP + Syne (Google Fonts) |
| データ管理 | JavaScript 配列（組み込み） + localStorage |
| PWA | Service Worker + Web App Manifest |
| バックエンド | なし（完全フロントエンドのみ） |
| Notion連携 | Notion API（MCP経由）でDB管理 |

---

## 🗄️ Notion DB 連携

問題データは Notion Database で管理しています。

- **DB名**: Rika Lab — Questions
- **スキーマ**: `question_text` / `unit` / `level` / `answer` / `choice_a〜d` / `explanation` / `status`
- **単元オプション**: `g4_plants` 〜 `g6_review`（31種）

---

## 📋 仕様

詳細な仕様書・導入手順書は Excel ファイルを参照してください。

- 🟢 アプリ仕様（画面構成・データフロー・カラーシステム）
- 🔵 データ設計（Notion DB スキーマ・フィールド定義）
- 🟣 単元・問題一覧（31単元 × 難易度別配分）
- 🔴 導入手順（4フェーズ17ステップ）

---

## 🗺️ ロードマップ

- [x] PWA 完成・公開
- [ ] 問題数 162問 → 500問以上に拡張
- [ ] iOS ネイティブアプリ化（SwiftUI）
- [ ] App Store リリース
- [ ] フリーミアムモデル実装（¥600/月）
- [ ] 塾・学校向け B2B ライセンス

---

## 📄 ライセンス

MIT License — 自由に使用・改変・配布できます。
問題コンテンツはオリジナル作成です。

---

<div align="center">
  Made with 🌿 by Rika Lab Team<br>
  <sub>Powered by Claude (Anthropic) × Notion</sub>
</div>
