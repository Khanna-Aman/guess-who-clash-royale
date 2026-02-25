# Security Policy

## Supported Versions

This is a static, client-side-only web application. There is no server, no database, and no authentication. The attack surface is minimal by design.

| Component | Supported |
|---|---|
| Game app (`index.html`, `game.js`, etc.) | ✅ Current `main` branch only |
| Auto-update pipeline (`.github/scripts/`) | ✅ Current `main` branch only |

---

## Scope

### In Scope
- Cross-Site Scripting (XSS) vulnerabilities in the game UI
- Sensitive data exposure (secrets, keys) in source code or git history
- GitHub Actions workflow vulnerabilities (secret injection, privilege escalation)
- Malicious dependency injection via `package.json`

### Out of Scope
- GitHub Pages infrastructure (report to GitHub)
- RoyaleAPI CDN issues (report to RoyaleAPI)
- Gemini API issues (report to Google)
- Theoretical issues with no practical exploitability in a local-game context

---

## Reporting a Vulnerability

If you discover a security issue, **please do not open a public GitHub Issue**.

Instead:

1. **Open a [GitHub Security Advisory](../../security/advisories/new)** (private disclosure — only visible to maintainers)
2. Include:
   - A clear description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

You can expect an acknowledgement within **48 hours** and a fix or disclosure decision within **7 days**.

---

## Security Architecture Notes

| Item | Detail |
|---|---|
| **Runtime dependencies** | Zero — the game runs on pure vanilla JS |
| **CI/CD dependencies** | `@actions/core` only (pipeline script, never shipped to users) |
| **Secret handling** | `GEMINI_API_KEY` stored exclusively in GitHub Secrets — never in source code |
| **Workflow permissions** | `contents: write` (card-updater only) · `pages: write` (deployer only) |
| **External script loading** | None — only Google Fonts CSS is fetched from an external origin |
| **Content Security Policy** | Not set (GitHub Pages limitation) — no eval, no inline event handlers |
