# Contributing to Clash Royale – Guess Who?

Thank you for your interest in improving this project! Here are the ways you can contribute and the guidelines to follow.

---

## 🃏 Adding / Fixing Card Data

All card data lives in two files that must **always be kept in sync**:

| File | Purpose |
|------|---------|
| `CARDS_DATA.json` | Human-readable source of truth (JSON format) |
| `cards.js` | Runtime version (`const CARDS_DATA_JSON = [...]`) — same data, wrapped as a JS global for `file://` compatibility |

### Card Object Schema

```js
{
  name:    "Knight",         // string — exact in-game name
  rarity:  "Common",        // "Common" | "Rare" | "Epic" | "Legendary" | "Champion"
  elixir:  3,               // number — use 0 for Mirror / variable-cost cards
  type:    "Troop",         // "Troop" | "Spell" | "Building"
  target:  "Ground",        // "Ground" | "Air & Ground" | "Buildings" | "None"
  hasEvo:  true,            // boolean — true if an Evolution variant exists in-game
  hasHero: true,            // boolean — true if a Hero Skin variant exists in-game
  flying:  false,           // boolean — true if the card moves/hovers as an air unit
  isGoblin: false,          // boolean
  isUndead: false,          // boolean
  isMan:    true,           // boolean — true if the card has a masculine character
  isHuman:  true,           // boolean — true if the character is specifically human
}
```

### Steps to Add a New Card

1. Fork the repository and create a branch: `git checkout -b add/new-card-name`
2. Add the entry to the correct elixir section in **both** `CARDS_DATA.json` and `cards.js`.
3. If the card's image slug differs from `name.toLowerCase().replace(/ /g, '-')`, add an entry to `SLUG_OVERRIDES` in `game.js`.
4. If the card's image is missing from the CDN, add its slug to `CDN_MISSING` in `game.js`.
5. Open a Pull Request with a description of what you added/fixed.

---

## 🐛 Reporting Bugs

Please open a GitHub Issue with:

- **Steps to reproduce** the bug.
- **Expected vs actual behavior**.
- **Browser and OS** you're using.
- Screenshot or screen recording if possible.

---

## 💡 Suggesting Features

Open a GitHub Issue tagged `enhancement` describing:

- The problem it solves or the experience it improves.
- A rough description of how it should work.

---

## 📐 Code Style

- Pure vanilla JS — no frameworks or dependencies.
- Preserve the existing section-header comment style in `game.js`.
- New CSS classes go into `styles.css` under the relevant section.
- Try to keep new filter logic inside the `wireFilters` function.
