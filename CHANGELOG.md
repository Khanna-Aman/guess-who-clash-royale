# Changelog

All notable changes to **Clash Royale — Guess Who?** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### 🐛 Fixed
- **Undo/scoring desync** — the manual `+` button and a missed guess now record an undoable history entry, so score, progression graph, and question log stay in sync after an undo.
- **Duplicate secret pick** — Player 2 can no longer pick the same card Player 1 already chose.
- Question log shows `(verbal)` instead of a misleading `(-0)` for manual/missed-guess entries.
- Removed dead `transitionModal` markup and stray debug logging.

### ♿ Accessibility
- Board cards are now real `<button>` elements with `aria-pressed` and a visible focus ring — fully keyboard and screen-reader operable.
- Guess modal: Enter submits, Escape cancels, Tab is trapped, and focus returns to the trigger on close.

### 🔒 Security / Hardening
- All card-name interpolation is HTML-escaped; image error handlers are attached via JS instead of inline `onerror` (removes an injection vector for LLM-sourced names).
- Pipeline validates/normalizes the Gemini response before it can patch source files.
- Added `.env.example`; verified no key ever entered git history.
- **Free-tier-only enforcement** for the Gemini pipeline: billing-required models are skipped (never called), plus a hard per-run call cap (`MAX_GEMINI_CALLS = 20`) as a runaway guard. Documented the no-billing-project setup as the definitive $0 guarantee.

### ⚙️ CI/CD & Tooling
- Test suite is now tracked (was gitignored) and gated: `deploy.yml` runs `node --test` before shipping; a new `tests.yml` runs on every PR; `check-cards.yml` validates data before any auto-commit.
- **Card-data source freshness guard** — the weekly pipeline now opens a deduplicated issue when the upstream source is missing cards the game already ships, so new-card detection can no longer fail silently.
- Added `sitemap.xml` (referenced by `robots.txt`) to the deploy.

### 🎨 UX
- **Play Again** starts a fresh match; **Menu** returns to the start screen (previously both reloaded the page).
- Filter flip animation capped at ~360ms so large eliminations don't lag the score/log update.

### 📚 Docs
- Honest automation status (badge + README); fixed stale `CONTRIBUTING.md` references; added a full production audit (`REVIEW.md`).

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
