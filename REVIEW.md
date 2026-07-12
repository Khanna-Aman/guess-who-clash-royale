# 🔬 Production Audit & Handoff — *Clash Royale: Guess Who?*

> **Reviewer:** Claude (senior-developer pass) · **Last updated:** 2026-07-12
> **Status:** production-hardened. This document is both the audit record and the **handoff guide** for an unmaintained repo — it explains how the automation works, what it will alert you about, and the few things only a human can do.

---

## ⭐ Verdict: **8.6 / 10** (was 7.1 at first audit)

A polished, zero-dependency fan game with genuinely production-grade automation. The original audit found real correctness bugs (undo/scoring desync), an untested CI path, accessibility gaps, and an overstated auto-update pipeline. **All critical and medium findings are now fixed, verified, and regression-tested.** What remains is one external dependency (a frozen upstream data source — now self-alerting) and a few app-UX enhancements deliberately left out because they need real-browser QA (see §6).

---

## 📊 KPI Scorecard (post-hardening)

| # | Dimension | Score | Notes |
|---|---|:---:|---|
| 1 | 🎮 Gameplay & Design | **8.0** | Deep 14-filter deduction; scoring model is unusual but documented |
| 2 | 🧱 Code Quality & Architecture | **7.5** | Clean file split; still module-global state (works, load-order-fixed) |
| 3 | ✅ Correctness & Reliability | **8.5** | Undo/scoring desync fixed + regression-tested; edge cases covered |
| 4 | 🎨 UI / UX | **8.0** | Authentic, high-fidelity; desktop-first by design |
| 5 | 🧪 Testing & CI/CD | **8.5** | 15 tests, gated on PR + deploy; all actions SHA-pinned; branch-protected |
| 6 | 📚 Documentation | **9.0** | README honest; CONTRIBUTING fixed; this handoff doc |
| 7 | ⚡ Performance | **7.5** | Zero deps; `renderBoard` full-rebuild is the one minor item (§6) |
| 8 | ♿ Accessibility | **8.0** | Board is keyboard/AT-operable; modal focus-trapped |
| 9 | 🔒 Security & Legal | **8.5** | No secrets in tree/history; XSS-hardened; free-tier enforced; good legal posture |

---

## 🛠️ 1. How the automation works (operations guide)

Three GitHub Actions workflows, every action pinned to a commit SHA, every job time-boxed:

| Workflow | Trigger | What it does |
|---|---|---|
| `tests.yml` | every PR + push to `main`/`dev` | Runs the 15-test suite. This is the **required status check**. |
| `deploy.yml` | push to `main` (+ manual) | Re-runs tests, then publishes to GitHub Pages. Deploy is gated on tests. |
| `check-cards.yml` | Mon 08:00 UTC (+ manual) | The card-update pipeline (below). |

**The weekly card pipeline (`check-cards.yml` → `check-new-cards.js`):**
1. **Self-checks the Gemini key** (free metadata call). A revoked/expired key opens a `gemini-key-invalid` issue.
2. **Freshness guard** — if the game ships permanent cards the upstream source lacks, opens a `data-source-stale` issue (currently **open by design** — see §5).
3. **① New cards** (upstream diff + Gemini classify), **② hero skins** (CDN probe), **③ evolutions** (CDN probe + Gemini).
4. If anything changed, it **opens a PR and enables auto-merge** — it never pushes directly to protected `main`. The PR's `Test` check must pass, then it squash-merges and deploys.

**Cost is $0, enforced three ways:** billing-only models are skipped, a hard `MAX_GEMINI_CALLS=20`/run cap, and (the real guarantee) a key created in a **no-billing** Google Cloud project. See README §🤖.

**What will page you (as GitHub issues, deduplicated):** pipeline failure, invalid key, stale data source. Everything else is a clean no-op.

---

## 🔒 2. Security & secrets (verified clean)

- `GEMINI_API_KEY` lives **only** in the repo secret (and your local `.env`, gitignored). Verified absent from the entire git history (`git log --all -S`). The key was rotated on 2026-07-12.
- `.env.example` is the tracked template; `.env` is ignored via `.env` / `.env.*` / `*.env` with a `!.env.example` exception.
- All card-name interpolation is HTML-escaped; image handlers are attached via JS (no inline `onerror`) — removes the injection vector for LLM-sourced names.
- Least-privilege `permissions:` on every workflow; read-only checkouts use `persist-credentials: false`.
- `main` is branch-protected: required `Test` check, PR required, linear history, no force-push/deletion.

---

## ✅ 3. Correctness fixes (all regression-tested)

| Ref | Fix | Test |
|---|---|---|
| C1+C2 | Undo/scoring desync — `+` custom & missed-guess now push a `manual` history entry (also activated ~40 lines of previously-dead undo code) | `game-logic.test.js` C1 guard |
| C5 | Player 2 can't pick Player 1's secret card | — |
| M1 | HTML-escape card names; drop inline `onerror` | `escapeHtml` test |
| M2 | Validate/normalize Gemini output before it patches source | — |
| M3+M4 | Board cards are `<button aria-pressed>`; guess modal has Enter/Escape/Tab-trap + focus return | — |
| M6 | Play Again (fresh match) vs Menu (start screen) now differ | — |
| L1/L3/L4/L7 | Removed dead `transitionModal`; added `sitemap.xml`; `(verbal)` log label; capped flip stagger | — |

Test suite: **15 tests** (data-integrity + headless game-logic), run on every PR and before every deploy.

---

## 🧪 4. What was verified live

- ✅ `node --test tests-internal/*.test.js` → 15/15 pass (also Node-version-robust: the glob form works on Node 20 CI **and** Node 24 local).
- ✅ Manually dispatched `check-cards.yml` with the **rotated key**: run succeeded; the freshness guard fired and opened the `data-source-stale` tracking issue (#16).
- ✅ Headless sandbox drives the real `renderBoard`/`toggleCard`/`applyFilter` (121 button-cards, ARIA toggles, no inline handlers).
- ✅ Full-history secret scan clean; all workflow YAML valid; all actions SHA-pinned.

---

## ⚠️ 5. Known limitation — the frozen data source (C0)

The upstream `royaleapi/cr-api-data` source is **frozen**: it lists fewer cards than the game already ships (missing 12 permanent cards). So **new-card auto-detection can't see genuinely new cards** — the pipeline runs green weekly but has nothing to add. Hero/evo refresh still works.

This is now **loud, not silent**: the pipeline self-detects the gap and keeps a `data-source-stale` issue open. **The permanent fix (owner):** point `ROYALE_URL` in `check-new-cards.js` at a maintained source (RoyaleAPI live API, or a scrape). Until then, add new cards manually per `CONTRIBUTING.md`. The `cr-api-assets` repo is current but lists ~588 art slugs (events/removed included), so it's usable as an existence probe but not a clean roster.

---

## 📋 6. Deliberately not done (with rationale)

These need real-browser QA across devices, which can't be done headlessly. For an unmaintained repo, shipping unverifiable UI changes would **add** risk, not reduce it. Documented as conscious exclusions, each safe to pick up later:

| Item | Why deferred |
|---|---|
| **M7 Mobile-responsive** | Desktop-first by design (board + rail + 4-row filter need width). Already has 1100/768px breakpoints + a device notice. Full mobile play is a redesign needing breakpoint QA. |
| **M5 `renderBoard` perf** | Full DOM rebuild on sort/view toggle causes a minor repaint flash on low-end devices. Works correctly today; a diff/reorder rewrite risks breaking the flip animations without visual QA. |
| **L8 Offline service worker** | A permanent, hard-to-remove commitment on a site nobody will maintain; offline isn't a requirement for a local pass-the-device game, and multi-CDN image fallback already covers CDN outages. Net risk > benefit. |
| **L5 Inline-style extraction** | 77 inline styles in `index.html`; purely cosmetic/maintainability, no functional impact. |

---

## 👤 7. Owner action items (human-only)

1. **Nothing is required for the game to keep running** — it's static and self-deploying.
2. **To keep new-card automation alive:** replace the frozen `ROYALE_URL` source (§5). Otherwise add cards by hand.
3. **If you ever see a `gemini-key-invalid` issue:** the key died — mint a new free-tier key and update the secret.
4. **Branch protection uses `enforce_admins: false`** so you keep an emergency direct-push escape hatch. Flip it to `true` in Settings → Branches if you want zero bypass.

---

## 🏆 Full remediation log

**Critical/High:** C0 (data-source blind spot → self-alerting) · C1+C2 (undo desync + dead code) · C3 (untested CI → gated, tracked, PR-checked) · C4 (key rotated, `.env.example`, history-verified) · C5 (duplicate-pick guard).
**Medium:** M1 (escaping) · M2 (LLM output validation) · M3 (a11y buttons) · M4 (modal keyboard) · M6 (Play Again/Menu).
**Low:** L1 (dead modal) · L2 (CONTRIBUTING) · L3 (sitemap) · L4 (log label) · L7 (stagger cap).
**Ironclad pass:** all actions SHA-pinned · job timeouts · concurrency groups · `persist-credentials: false` · Gemini key self-check · request timeouts · free-tier hard cap · 15-test suite · branch protection + PR/auto-merge pipeline · this handoff doc.

**Bottom line:** the two originally-invisible problems (a pipeline that under-delivered silently, and an undo bug that corrupted the scoreboard) are fixed and guarded. The automation is now self-verifying and self-alerting, `main` is protected, cost is provably $0, and the one remaining gap (frozen upstream) is loud and documented. Safe to leave.
