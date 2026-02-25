# Changelog

All notable changes to **Clash Royale — Guess Who?** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

---

## [1.0.0] — 2026-02-25

### ✨ Added — Game Features
- Full 121-card Clash Royale roster (Common → Champion) with rarity borders
- 14 filter categories: Type, Rarity, Elixir, Target, Flying, Evo, Hero, Win-Con, Swarm, Tank, Spawner, Hit Air, Goblin, Undead, Male, Human
- Two-tier undo: Step Undo (last action only) and Full-Q Undo (entire last question + all trailing flips)
- Sort by Name / Elixir / Rarity / Type — ascending and descending
- Toggle between All cards and Active-Only board views
- Pass-the-Device animated full-screen interstitial (with look-away prompt only during card pick phase)
- Hold-to-Reveal button for peeking at your own secret card mid-game
- Autocomplete type-ahead guess modal
- Score Adjuster manual `+/−` buttons for verbal questions
- End-of-game results screen with HiDPI-aware Canvas progression graph and 8-metric comparison table
- Floating Question Log panel tracking every filter applied, cards eliminated, and efficiency colour
- Non-blocking toast notifications when a filter eliminates zero cards
- Rainbow shimmer for Legendary cards, gold glow pulse for Champion cards
- ⚡ Evolution and 🦸 Hero Skin badges on every eligible card

### 🤖 Added — Automation Pipeline
- GitHub Actions `deploy.yml`: auto-deploy to GitHub Pages on every push to `main`
- GitHub Actions `check-cards.yml` + `check-new-cards.js`: weekly automated card update pipeline
  - Check ①: Detects new CR cards via RoyaleAPI open-data diff
  - Check ②: CDN HEAD probe refresh for hero skins on all existing cards
  - Check ③: Single Gemini Flash call to refresh Evolution flags across all cards
  - Auto-commits patched `cards.js`, `CARDS_DATA.json`, `cards-annotations.js`, `config-filters.js`

### 🗂️ Added — Data Architecture
- Three-file card data split: `cards.js` (core facts) · `cards-annotations.js` (manual community layer) · `config-filters.js` (meta role sets)
- `CARDS_DATA.json` human-readable mirror of `cards.js`
- `mergeCoreAndAnnotations()` merges all sources into final runtime `CARDS` array

### 🎨 Added — Design System
- CSS custom properties design token system (`--cr-blue`, `--cr-gold`, `--cr-purple`, `--cr-bg`, `--rail-width`, `--qlog-width`, `--side-clearance`)
- Outfit (Google Fonts, 400–900 weight) for all typography
- Sticky filter bar and sticky board controls bar
- Responsive layout with floating Q-Log panel left of main board
- Aria labels on all icon-only buttons; `role="dialog"` + `aria-modal` on modals
