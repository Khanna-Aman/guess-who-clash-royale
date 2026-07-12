# 🔬 Production-Grade Audit — *Clash Royale: Guess Who?*

> **Reviewer:** Claude (senior-developer pass) · **Date:** 2026-07-12 · **Scope:** full repo — code, UI/UX, data, CI/CD, security, legal
> **Method:** every source file read in full; tests executed; card data cross-checked; git history and `.env` state verified; automation scripts inspected.

---

## ⭐ Overall Verdict: **7.6 / 10**

A genuinely polished, zero-dependency fan game with production-grade automation and documentation. It is held back from an 8.5+ by a small number of **real correctness bugs** in the undo/scoring layer, tests that exist but are **never run in CI**, accessibility gaps, and a few hygiene items. The gap to "excellent" is narrow and concrete.

---

## 📊 KPI Scorecard

| # | Dimension | Score | Weight | Weighted |
|---|---|:---:|:---:|:---:|
| 1 | 🎮 Gameplay & Design | **8.0 / 10** | 15% | 1.20 |
| 2 | 🧱 Code Quality & Architecture | **7.0 / 10** | 14% | 0.98 |
| 3 | ✅ Correctness & Reliability | **6.5 / 10** | 14% | 0.91 |
| 4 | 🎨 UI / UX | **8.0 / 10** | 12% | 0.96 |
| 5 | 🧪 Testing & CI/CD | **4.0 / 10** | 14% | 0.56 |
| 6 | 📚 Documentation | **7.5 / 10** | 8% | 0.60 |
| 7 | ⚡ Performance | **7.5 / 10** | 7% | 0.53 |
| 8 | ♿ Accessibility | **6.0 / 10** | 7% | 0.42 |
| 9 | 🔒 Security & Legal | **7.5 / 10** | 9% | 0.68 |
| | **TOTAL** | | **100%** | **≈ 7.3** |

> **Score revised down from an initial 7.6:** the flagship "auto-updates weekly" pipeline is, on inspection, non-functional (see **C0**). This pulls CI/CD and Documentation down, since a headline feature does not work and the README/badge assert otherwise.

**Verification performed for this audit**
- ✅ `node --test tests-internal/logic.test.js` → 4 pass / 0 fail
- ✅ Card counts consistent: `cards.js` = 121, `CARDS_DATA.json` = 121
- ✅ `.env` is **not** tracked and **not** in git history (`.gitignore` covers it)
- ✅ Confirmed dead code and missing handlers via static grep
- ✅ **Live-probed the automation pipeline:** `github-actions[bot]` has **0 commits** in history; upstream data source (`cr-api-data`) is **frozen at 120 cards, missing 12 the game already has**; CDN evo/hero probe conventions still return `200`; **0** currently-missed evolutions

---

## 🔴 Critical & High-Priority Findings

These are the findings that most affect a real player or a production deploy. Several were **not** caught in prior reviews.

### C0 — The flagship "auto-updates weekly" pipeline is non-functional *(CI/CD, CRITICAL)*

The README, a status badge, and `check-cards.yml`'s header all advertise a "fully automated, zero-human-intervention" weekly pipeline that detects new cards / hero skins / evolutions and commits them back to `main`. **In practice it has never worked.** This was verified live, not read from the YAML:

**Evidence**
1. **Zero bot commits, ever.** `git log --all --author="github-actions"` is empty. In the repo's ~4.5-month life, the pipeline has produced no commits. Every card in `cards.js` was hand-added.
2. **The cron is dormant.** Last human commit: `2026-03-02`. GitHub **automatically disables scheduled workflows after 60 days of no repository activity**, so the Monday cron has almost certainly not fired since ~early May 2026.
3. **The upstream data source is frozen — the real root cause.** New-card detection diffs local data against `https://royaleapi.github.io/cr-api-data/json/cards.json`. Fetched live, that source returns **120 cards and is already missing 12 permanent cards the game ships**: `Berserker, Suspicious Bush, Goblin Curse, Vines, Void, Little Prince, Goblin Demolisher, Rune Giant, Goblin Machine, Goblinstein, Spirit Empress, Boss Bandit`. Diffing against a frozen upstream can **never** surface a genuinely new card — so new-card detection is structurally dead even if the cron fired perfectly. (The upstream's event-only cards — Super Witch, Terry, Party Hut, etc. — are correctly excluded by the blocklist, so that part works.)
4. **The detection *logic* is actually fine**, which is why the rot is invisible. The CDN probe conventions still resolve: `knight-ev1.png` and `knight-hero.png` both return `200`. A full sweep of all 82 locally-"no-evo" cards against the CDN found **0 missed evolutions** — the data happens to be current today.

**Net:** the automation is dead on two independent axes (dormant cron + frozen source), but causes no *visible* damage yet because the data is coincidentally up to date. The first real card or evolution Supercell ships after this point will be **silently missed**, and no failure issue will be raised because the workflow isn't running.

**Fix (in priority order)**
1. **Correct the documentation now** — either fix the pipeline or stop advertising "auto-updated weekly" (README badge + `## 🤖 GitHub Actions` section + `data/` ownership table). Claiming a working automation that isn't is the most damaging part.
2. **Re-enable the workflow** and add a keep-alive (the cron won't survive repo inactivity; either commit periodically or use a `workflow_dispatch` + external ping).
3. **Replace / re-verify the data source.** `cr-api-data` appears abandoned; move to a maintained source (e.g. RoyaleAPI's live API, or scrape the CDN asset listing directly) or the "new card" branch is permanently blind.
4. **Add an end-to-end smoke test** the pipeline runs in dry-run mode on every push, so a broken source URL or CDN convention change surfaces immediately instead of silently.
5. **Confirm `GEMINI_API_KEY` is set as a repo secret** and check the Actions run history for red runs — the local `.env` key does not prove the CI secret exists.

### C1 — State desynchronization on undo after "Custom +" or a wrong guess *(correctness, HIGH)*

The `+` custom-question button (`js/game.js:48-73`) and the wrong-guess path (`js/renderer.js:307-316`) both mutate **score + `progression` + `questionLog`**, but push **nothing to `state.history`**. Undo, however, pops from all four in lockstep (`js/state.js:92`).

Reproduction:
1. Apply a filter → `history=[F]`, `prog=[a]`, `qlog=[F]`, score `1`
2. Press `+` (custom) → `history=[F]`, `prog=[a,b]`, `qlog=[F,custom]`, score `2` ← arrays now length-mismatched
3. Press **Undo Step** → pops `F` from history and `-1` score, but `prog.pop()` / `qlog.pop()` remove the **custom** entry, not the filter's.

**Result:** the board un-flips the filter's cards while the score, progression graph, and question log all describe a *different* state. A wrong guess's `+1` can also never be undone. This silently corrupts the scoreboard mid-game.

**Fix:** push a proper `{ type: 'manual', flips: [] }` history entry from both call sites. The undo code already knows how to handle it — see C2.

### C2 — ~40 lines of dead, unreachable undo code *(code quality, HIGH)*

`undoLast` and `undoFullQuestion` both contain a full `action.type === 'manual'` branch (`js/state.js:112` and `js/state.js:168`), but `state.history.push` is **only ever** called with `'flip'` and `'filter'` (`js/filters.js:9`, `js/filters.js:33`). No code produces a `'manual'` entry, so the branch is unreachable.

**This is the same fix as C1**: pushing `'manual'` history entries from the two call sites activates this already-written branch. Two birds, one commit. Add a test alongside it.

### C3 — No CI gate: tests exist but never run *(CI/CD, HIGH)*

`deploy.yml` copies files and ships straight to GitHub Pages; it never runs `node --test`. Worse, `check-cards.yml` **auto-commits machine-generated changes to `cards.js` and auto-deploys them** with no validation. A broken merge function, a malformed card entry, or a bad LLM response reaches production with zero gate.

**Fix:**
- Add a `test` job to `deploy.yml` that runs `node --test tests-internal/logic.test.js` as a required predecessor to the deploy job.
- Run the same test suite (plus a JS-parse check on `cards.js`) inside `check-cards.yml` **before** the auto-commit step.

### C4 — Live Gemini API key in the working tree *(security, HIGH — no leak yet)*

`.env` contains a real `GEMINI_API_KEY=AIza…`. **Good news:** it is not tracked and not present anywhere in git history, and `.gitignore` correctly covers `.env` / `.env.*` / `*.env`. The exposure is local-disk only.

**Recommendation:** rotate the key in Google AI Studio as a precaution (it has been read into tooling), and keep using CI secrets for the pipeline. This is a "no harm yet — close the door" item.

### C5 — Duplicate secret-card pick is unguarded *(gameplay, MEDIUM-HIGH)*

`showPickScreen(2)` (`js/renderer.js:58`) never excludes Player 1's already-chosen card. Both players can secretly pick the same card, producing an asymmetric, confusing game.

**Fix:** pass `state.secretP1` into P2's picker and grey-out / exclude that card.

---

## 🟠 Medium-Priority Findings

### M1 — Unescaped interpolation into `innerHTML` and inline event attributes *(security / robustness)*

Card names flow unescaped into both `innerHTML` and inline handlers, e.g. `onerror="handleCardImgError(this, '${card.name}')"` (`js/renderer.js:182`, `js/renderer.js:88`). Today's dataset is safe, but the card pipeline is **LLM-fed**; a future name containing `'`, `"`, or `<` would break the handler or inject markup. Escape the value or build nodes with `textContent` / `dataset`.

### M2 — Fragile LLM → source-code pipeline *(reliability / supply chain)*

`.github/scripts/check-new-cards.js` parses Gemini output via `JSON.parse(raw.replace(/```json|```/g,''))` (`:287`) and then **string-concatenates the result directly into `cards.js` source** (`:323-329`), which is then auto-committed and deployed. A malformed or adversarial model response could inject broken (or arbitrary) JS. Add: schema validation of the parsed object, a `node -c`/parse check on the rewritten file, and the test gate from C3 before committing.

### M3 — Board cards are not keyboard-accessible *(accessibility)*

All 121 board cards are `<div onclick>` (`js/renderer.js:176-180`) — not focusable or activatable by keyboard or screen-reader users. Change `card-container` to `<button type="button">` with `aria-pressed` reflecting the flipped state.

### M4 — No `Enter`-key support anywhere *(UX / accessibility)*

Grep confirms **zero** `keydown`/`keypress`/`Enter` handlers in the codebase. The guess modal requires a mouse click on "Confirm Guess". Add `Enter`-to-submit on `guessInput` when the confirm button is enabled; return focus to `btnGuess` on close and trap focus while open.

### M5 — `renderBoard()` rebuilds all 121 nodes on every sort/view toggle *(performance)*

`board.innerHTML = ''` then recreates every card (`js/renderer.js:166-189`) on each sort/view change, causing a repaint flash on low-end devices. Prefer CSS `order`-based re-sort, or cache elements in a `Map<index, HTMLElement>` and re-append.

### M6 — Results "Play Again" and "Menu" are identical *(UX)*

Both `btnPlayAgain` and `btnBackToMenu` call `location.reload()` (`js/renderer.js:364-366`). "Play Again" should re-enter the picker; "Menu" should show the start screen — ideally without a full reload.

### M7 — Desktop-only; degrades below ~1100px *(UI)*

The 4-row filter bar and right rail collapse poorly on tablets/phones; the README explicitly warns "best on laptop/desktop." A collapsible filter drawer would make tablets viable.

---

## 🟡 Low-Priority / Hygiene

| # | Issue | Location |
|---|---|---|
| L1 | **Dead HTML:** `transitionModal` (`transIcon`/`transTitle`/`transScore`/`transNextBtn`) has zero JS references — confirmed by grep. Remove or wire up. | `index.html:450-459` |
| L2 | **Stale CONTRIBUTING.md:** step 3 points `SLUG_OVERRIDES` to `game.js` (it lives in `utils.js`); step 4 references `CDN_MISSING` in `game.js`, which no longer exists. | `CONTRIBUTING.md:39-40` |
| L3 | **`robots.txt` references a non-existent `sitemap.xml`.** Generate one or drop the line. | `robots.txt` |
| L4 | **Question log shows `(-0)`** for manual/custom/missed-guess entries — misleading. Omit the badge or render `(verbal)` when `isManual`. | `js/renderer.js:229` |
| L5 | **77 inline `style="..."` attributes** in `index.html` + a 2,130-line `styles.css` make theming hard. Extract repeated inline styles into named classes. | `index.html`, `css/styles.css` |
| L6 | **Card name font is `0.6rem`** and clips long names with ellipsis; the `title` tooltip already exists, so hover-full-name is nearly free. | `css/styles.css` |
| L7 | **Filter animation stagger** (`12ms × up-to-121 ≈ 1.45s`) lets score/log update before flips finish. Cap stagger at ~30 cards. | `js/filters.js:35-42` |
| L8 | **No offline/service-worker caching** — if the RoyaleAPI CDN is down, all images fail. A cache-first SW would make it offline-capable. | — |

---

## ✅ What's genuinely strong

- **Zero runtime dependencies.** Pure HTML/CSS/JS, runs on `file://`, fastest possible cold start.
- **The automation is well-*engineered*, even though it's non-functional (C0).** `check-cards.yml` and `check-new-cards.js` show real care: pinned action SHAs, least-privilege `permissions`, `npm ci` with a committed lockfile, concurrency guard, model-fallback + 429 retry on the Gemini client, atomic multi-file flips with rollback, and de-duplicated failure issues. The craftsmanship is genuine — it just needs to actually run and point at a live data source.
- **Clean file separation** across `state.js` / `filters.js` / `renderer.js` / `utils.js` / `game.js` / `config-filters.js` / `cards-annotations.js`, with a well-documented three-layer data model (`mergeCoreAndAnnotations`).
- **High-fidelity UI** — authentic CR palette, Legendary rainbow shimmer, Champion gold-glow, staggered flip animations, active-count pill with colour transitions, HiDPI canvas progression graph, 8-metric stats table.
- **Documentation is thorough and well-organized** — README covers features, scoring, structure, tech stack, design tokens, data architecture, and CI/CD. (Docked from "excellent" only because it asserts an auto-update pipeline that doesn't run — see C0 — and CONTRIBUTING.md has stale references.)
- **Multi-CDN image fallback** (4 CDNs × 7 slug variants) is robust against upstream asset churn.

---

## ⚖️ Legal Assessment — solid, with two nuances

The disclaimer (`README.md:210-223`) is well-crafted: it names Supercell and Hasbro, disclaims affiliation, cites Supercell's Fan Content Policy, scopes the MIT license to **code only**, and explicitly excludes third-party assets/trademarks. Two things to stay mindful of:

1. **The "Guess Who?" name** appears in the `<title>` and OG tags. Trademark law on *names* is more permissive than the disclaimer's confidence implies — you're relying on nominative fair use, which is defensible for a non-commercial fan project, but it is a reliance, not an absolute.
2. **Supercell's Fan Content Policy requires non-commercial use.** Keep the project ad-free and donation-free to remain compliant. Adding monetization would change the analysis.

Overall the legal posture is appropriately careful.

---

## 🏆 Prioritized Action Plan (impact ÷ effort)

| # | Action | Impact | Effort | Refs |
|---|---|:---:|:---:|---|
| 1 | **Fix the docs↔reality gap:** either revive the pipeline (re-enable cron + swap the frozen `cr-api-data` source + add a dry-run smoke test) **or** stop advertising "auto-updated weekly" in the README/badge | 🔴 Crit | 🟡 Med | C0 |
| 2 | Push `manual` history entries from `+` and wrong-guess → fixes desync **and** activates dead undo branch | 🔴 High | 🟢 Low | C1, C2 |
| 3 | Add `node --test` gate to `deploy.yml` and pre-commit in `check-cards.yml` | 🔴 High | 🟢 Low | C3 |
| 4 | Rotate the Gemini key; confirm secret-only usage | 🔴 High | 🟢 Low | C4 |
| 5 | Validate LLM output (schema + `node -c`) before writing/committing `cards.js` | 🟠 Med | 🟡 Med | M2 |
| 6 | Guard duplicate secret picks — exclude P1's card from P2's picker | 🟠 Med | 🟢 Low | C5 |
| 7 | Make board cards `<button aria-pressed>` + Enter-to-submit + focus trap in guess modal | 🟠 Med | 🟡 Med | M3, M4 |
| 8 | Escape card names in `innerHTML` / `onerror` interpolation | 🟠 Med | 🟢 Low | M1 |
| 9 | Fix stale `CONTRIBUTING.md` (`utils.js`; remove `CDN_MISSING`) | 🟡 Low | 🟢 V.Low | L2 |
| 10 | Remove dead `transitionModal`; fix `robots.txt` sitemap; fix `(-0)` log badge | 🟡 Low | 🟢 V.Low | L1, L3, L4 |
| 11 | Add tests for `applyFilter`, `undoLast`, `undoFullQuestion`, `adjustScore`, `computeStats` | 🔴 High | 🟡 Med | C3 |

**Bottom line:** an above-average, lovingly-built fan game whose two biggest problems are *invisible* today: a flagship auto-update pipeline that has never actually run (C0), and an undo/scoring desync that quietly corrupts the scoreboard mid-game (C1). Neither shows up in a quick demo, which is exactly why they survived. The path to 8.5+ is short and concrete — be honest about (or revive) the automation, fix the desync, gate deploys on the tests that already exist, and close the accessibility and key-hygiene items. The underlying craftsmanship is real; the gaps are in operational truth and edge-case correctness.
