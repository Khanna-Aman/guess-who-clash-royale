<div align="center">

<img src="docs/assets/banner.png" alt="Clash Royale — Guess Who? Banner" width="100%" style="border-radius:12px;max-width:900px;" />

# ⚔️ Clash Royale — Guess Who?

**A high-fidelity, local-multiplayer deduction game featuring the full Clash Royale card roster.**  
Built entirely with vanilla HTML, CSS, and JavaScript. No frameworks. No build step. Just open and play.

> 💻 **Note:** This game is best experienced on a laptop or desktop (large screen).

[![Play Online](https://img.shields.io/badge/🎮%20Play%20Now-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://Khanna-Aman.github.io/guess-who-clash-royale/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)
[![Cards](https://img.shields.io/badge/Cards-121-purple?style=for-the-badge)](./js/cards.js)
[![Auto-Checked](https://img.shields.io/badge/Data-Auto--Checked%20Weekly-brightgreen?style=for-the-badge&logo=github-actions)](./.github/workflows/check-cards.yml)

</div>

---

## 🎮 Play It

**Instant play — no install, no server, no dependencies:**

```
Open index.html in any modern browser
```

Or play the live hosted version on **[GitHub Pages →](https://Khanna-Aman.github.io/guess-who-clash-royale/)**  
Auto-deploys on every push to `main`.

> 💡 **Setup:** `Settings → Pages → Source: GitHub Actions`

---

## ✨ Features

| Feature | Details |
|---|---|
| 🃏 **121 Cards** | Full CR roster — Common, Rare, Epic, Legendary, Champion |
| 🔍 **14 Filter Categories** | Type · Rarity · Elixir Cost · Attack Target · Flying · Evo · Hero · Win-Con · Swarm · Tank · Spawner · Hit Air · Goblin · Undead · Male · Human |
| ↩️ **Two-tier Undo** | Step Undo (last action) · Full-Q Undo (entire last question + all trailing flips) |
| 🔄 **Sort + View** | Sort by Name / Elixir / Rarity / Type, Asc/Desc · Toggle All / Active-Only view |
| 📱 **Pass-the-Device** | Full-screen animated interstitial for safe secret-card selection |
| 🌈 **Rarity Borders** | Rainbow shimmer (Legendary) · Gold glow (Champion) · consistent across picker & board |
| 🏅 **Evo & Hero Badges** | ⚡ Evolution and 🦸 Hero Skin badges on every eligible card |
| 📈 **End-of-Game Stats** | HiDPI-aware Canvas progression graph + 8-metric comparison table |
| 👁️ **Hold-to-Reveal** | Hold the button to peek at your own secret card mid-game |
| 🔔 **Toast Notifications** | Non-blocking warn toast when a filter eliminates zero cards |
| 📋 **Question Log** | Live floating panel tracking every filter applied, cards eliminated, and efficiency colour |
| 🎯 **Autocomplete Guess** | Type-ahead suggestions when making your final guess |
| ±️ **Score Adjuster** | Manual +/− score buttons for custom verbal questions |

---

## 🕹️ How to Play

1. **Player 1** secretly picks their own card, then passes the device.
2. **Player 2** secretly picks their own card, then passes the device back.
3. Players alternate turns trying to guess the opponent's card. Each turn, the active player:
   - Uses the **filter dropdowns** to eliminate groups of cards *(costs +1 point each)*.
   - **Clicks cards** to flip/unflip them manually for free.
   - Uses the **Question Log** on the left to track their deduction history.
   - When ready, hits **🎯 Guess (+1)** and types the card name with autocomplete.
4. **Lower score wins** — fewer questions = sharper detective!

### Scoring

| Action | Score |
|---|---|
| Apply a filter | **+1 point** |
| Make a guess | **+1 point** |
| Manual verbal question (`+` button) | **+1 point** |
| Flip / unflip a card | **Free** |
| Undo a filter | **−1 point** |

Score is floored at 0. Results screen shows both scores, winner verdict, a progression graph, and an 8-metric breakdown table.

---

## 🗂️ Project Structure

```
guess-who-clash-royale/
├── index.html              # All screens: Start, Picker, Game, Results, Modals
├── css/
│   └── styles.css          # Full design system + all component styles
├── js/
│   ├── game.js             # Core game engine — state, rendering, filters, undo, scoring
│   ├── cards.js            # 121-card data array (runtime source of truth)
│   ├── cards-annotations.js # Manual community layer: hero skins, creature types, lore flags
│   ├── config-filters.js    # Community role sets: SWARM_CARDS, TANK_CARDS, SPAWNER_CARDS
│   ├── utils.js            # Image handling and toast notification utilities
│   ├── state.js            # Game state and history management
│   ├── filters.js          # Card filtering logic
│   └── renderer.js         # DOM manipulation and UI rendering
├── data/
│   └── CARDS_DATA.json     # Human-readable mirror of cards.js (not used at runtime)
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml          # Auto-deploy to GitHub Pages on every push to main
│   │   └── check-cards.yml     # Weekly cron: refreshes hero/evo + alerts on stale source (see note)
│   ├── scripts/
│   │   └── check-new-cards.js  # Node pipeline: new cards + hero skins + evo refresh
...
├── docs/
│   └── assets/             # Banner image and demo media
├── CONTRIBUTING.md         # Card schema + steps to add / fix cards
├── SECURITY.md             # Vulnerability disclosure policy
└── LICENSE                 # MIT
```

---

## 🛠️ Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Structure** | HTML5 semantic markup | No build step — works on `file://` protocol |
| **Logic** | Vanilla JavaScript (ES2020) | Zero dependencies, maximum portability |
| **Styles** | CSS with custom properties | Design token system for colours, spacing, and panel widths |
| **Font** | [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts | 400 → 900 weights |
| **Card Images** | [RoyaleAPI CDN](https://royaleapi.github.io/cr-api-assets/) | Auto-resolved from card name slug |
| **Graph** | Canvas API | HiDPI-aware (`devicePixelRatio`) progression chart |
| **CI/CD** | GitHub Actions | Test-gated auto-deploy + a weekly card-update pipeline (runs; new-card check blocked by a frozen upstream — see GitHub Actions section) |

---

## 🎨 Design System

The UI is themed around the Clash Royale visual language using CSS custom properties:

| Token | Value | Usage |
|---|---|---|
| `--cr-blue` | `#2c6fbb` | Primary brand colour, P1 accents |
| `--cr-gold` | `#f5c842` | CTAs, score display, champion border |
| `--cr-purple` | `#7c3aed` | Elixir badges |
| `--cr-bg` | `#0b1628` | Page background |
| `--cr-panel` | `#111d33` | Card and modal surfaces |
| `--rail-width` | `96px` | Secret card rail width |
| `--qlog-width` | `168px` | Question log panel width |
| `--side-clearance` | `calc(...)` | Main board right padding — single source of truth |

**Rarity borders:** Common (grey) · Rare (orange) · Epic (purple) · Legendary (rainbow shimmer animation) · Champion (gold glow pulse)

---

## 🧱 Data Architecture

Card data is split across three files for clarity of ownership:

| File | Contains | Updated by |
|---|---|---|
| `js/cards.js` | Core facts: `name`, `elixir`, `rarity`, `type`, `target`, `flying`, `hasEvo` | Weekly auto-check (hero/evo); new cards added manually while the upstream source is frozen — see note below |
| `js/cards-annotations.js` | Manual layer: `hasHero`, `isGoblin`, `isUndead`, `isMan`, `isHuman` | Human — no API exists for these |
| `js/config-filters.js` | Role sets: `SWARM_CARDS`, `TANK_CARDS`, `SPAWNER_CARDS` | Human — community meta classifications |
| `data/CARDS_DATA.json` | Human-readable mirror of `cards.js` | Reference only |

At runtime, `mergeCoreAndAnnotations()` in `cards-annotations.js` merges all three into the final `CARDS` array used by the game engine.

---

## 🤖 GitHub Actions

### Auto Deploy (`deploy.yml`)
Triggers on every push to `main`. Publishes the root directory to GitHub Pages using the official `actions/deploy-pages` action — no build step required.

### 🃏 Auto Card Update (`check-cards.yml`)

> ⚠️ **Status: running weekly, but new-card detection has a blind spot.** The workflow fires every Monday and completes successfully (verified: 12+ consecutive green scheduled runs). It has simply had nothing to commit since its one update on 2026-03-09, because:
> - **Check ① (new cards) is blind.** Its upstream source — [`royaleapi/cr-api-data`](https://github.com/RoyaleAPI/cr-api-data) — is **frozen**: it lists fewer cards than this game already ships (missing several permanent cards), so a genuinely new card can't be diffed in. **A maintained data source is needed** for new-card detection to work. Newly released cards must be added manually until then.
> - **Checks ② and ③ (hero / evo refresh) work** — they probe the live CDN — but currently find nothing new to flip.
>
> Net: the automation is healthy; the **data source feeding new-card detection is stale.** The pipeline now **detects this itself** — when the game ships permanent cards the upstream source doesn't list, it opens a single deduplicated `data-source-stale` issue so the blind spot is never silent. Swapping `ROYALE_URL` for a maintained source is the permanent fix.

Runs **every Monday at 08:00 UTC** (the day after typical CR patch days). Performs three automated checks:

| Check | What it does | API cost |
|---|---|---|
| ① New cards | Diffs RoyaleAPI open-data vs local `cards.js`, classifies new cards with Gemini | 1 Gemini call per new card |
| ② Hero skin refresh | CDN HEAD probe for every card without a hero skin | Free — no auth |
| ③ Evolution refresh | 1 Gemini call for ALL cards without an evo to check if any now have one | 1 Gemini call total |

If any changes are detected, the script **automatically patches `cards.js`, `CARDS_DATA.json`, `cards-annotations.js`, and `config-filters.js`**, then **opens a PR and enables auto-merge** — it never pushes directly to the branch-protected `main`. Once the `Test` check passes, the PR squash-merges and a fresh GitHub Pages deploy is triggered.

> **Cost: $0 — free tier only, enforced three ways.**
> 1. **Model chain is free-tier only.** Any model that would require billing returns `429 limit: 0` and is **skipped, never called** — the pipeline never falls back to a paid model.
> 2. **Hard call cap.** `MAX_GEMINI_CALLS = 20` per run aborts the run before it could ever burn quota (normal usage is ~1–4 calls/week; free tier is 1,500/day).
> 3. **The definitive guarantee — a no-billing project.** Create the key in a Google Cloud project with **no billing account linked** (default for a plain [AI Studio](https://aistudio.google.com/apikey) key). With no billing enabled, over-limit requests simply return `429` — Google *cannot* charge you. This is the real lock; the code guards are backups.

To use this automation in your own fork:
1. Create a **free** key at [Google AI Studio](https://aistudio.google.com/apikey) — do **not** link a billing account to its project.
2. Go to `Settings → Secrets and variables → Actions` and add a secret named `GEMINI_API_KEY` with that key.
3. Enable GitHub Pages via `Settings → Pages → Source: GitHub Actions`

To run the pipeline **locally**, copy `.env.example` to `.env` and add your key (the `.env` file is gitignored — never commit it).

---

## 🙌 Credits & Data Sources

- **Card artwork** — [RoyaleAPI Assets CDN](https://github.com/RoyaleAPI/cr-api-assets)
- **Card data source** — [RoyaleAPI open-data](https://github.com/RoyaleAPI/cr-api-data) + in-game observations
- **Font** — [Outfit](https://fonts.google.com/specimen/Outfit) via Google Fonts
- **Card classification pipeline** — powered by [Gemini Flash](https://ai.google.dev/)

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full card schema, steps to add new cards, and how to update the annotation and filter config files.

---

## 🔒 Security

See [SECURITY.md](./SECURITY.md) for our vulnerability disclosure policy.

---

## ⚖️ Legal Disclaimer

This is a **non-commercial, fan-made project** created for educational and entertainment purposes only.

*   **Clash Royale** assets, characters, and related media are trademarks and copyrights of **Supercell Oy**. Card artwork is served at runtime from the [RoyaleAPI open-asset CDN](https://github.com/RoyaleAPI/cr-api-assets) and is not hosted or redistributed by this repository.
*   **Guess Who?** is a trademark of **Hasbro, Inc.** No Hasbro visual assets are used; only the uncopyrightable gameplay mechanic (asking yes/no questions to deduce a hidden character) is referenced.

This project is **not affiliated with, endorsed by, or sponsored by** Supercell or Hasbro. It is created in compliance with [Supercell's Fan Content Policy](https://supercell.com/en/fan-content-policy/). No copyright or trademark infringement is intended. All original intellectual property belongs to their respective owners.

---

## 📄 License

The original source code (JS, CSS, HTML, GitHub Actions) is released under the [MIT License](./LICENSE). Third-party assets — Clash Royale card artwork (© Supercell), the "Clash Royale" trademark, and the "Guess Who?" trademark — are explicitly excluded from that licence and remain the property of their respective owners. See [LICENSE](./LICENSE) for full details.
