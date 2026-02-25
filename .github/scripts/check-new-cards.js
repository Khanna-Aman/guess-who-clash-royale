/**
 * check-new-cards.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully-automated Clash Royale card update pipeline.
 *
 * WHAT IT DOES — three checks, every Monday:
 *
 *  ① NEW CARD CHECK
 *     - Fetches latest card list from RoyaleAPI open-data
 *     - Diffs against cards.js to find brand-new cards
 *     - For each new card:
 *         a. CDN probe for hero skin → hasHero  (free, no API)
 *         b. Gemini Flash → target, flying, hasEvo, isGoblin, isUndead,
 *            isMan, isHuman, isSwarm, isTank, isSpawner
 *         c. Patches cards.js, CARDS_DATA.json, cards-annotations.js,
 *            config-filters.js
 *
 *  ② HERO SKIN REFRESH (free — CDN HEAD probes only)
 *     - Re-probes CDN for every existing card where hasHero: false
 *     - If a hero skin now exists → flips hasHero false→true in all files
 *     - Catches: "Giant has been out for 8 years, hero skin just dropped"
 *
 *  ③ EVOLUTION REFRESH (1 Gemini call total, regardless of card count)
 *     - Sends ONE prompt to Gemini with every card where hasEvo: false
 *     - Gemini returns a JSON array of which ones NOW have evolutions
 *     - Flips hasEvo false→true in all relevant files for those cards
 *     - Catches: "Fireball existed for 6 months, then got an Evolution"
 *
 * WHAT NEVER NEEDS REFRESHING (intrinsic card properties):
 *   flying, target, isGoblin, isUndead, isMan, isHuman — these are
 *   baked into the card's identity and never change after release.
 *   isSwarm / isTank / isSpawner are community meta-classifications
 *   that rarely change and can be edited manually in config-filters.js.
 *
 * COST:
 *   CDN probes  — pure HTTPS HEAD requests. Always free. No auth needed.
 *   Gemini Flash — FREE tier: 1,500 req/day, 1M tokens/day.
 *     • Check ①: 1 Gemini call per new card (rare — 1-3 per patch)
 *     • Check ③: 1 Gemini call total for ALL evo checks combined
 *   Worst case per week: ~4 Gemini calls. Free tier limit: 1,500/day.
 *   You will NOT be charged.
 *
 * OUTPUTS:
 *   Always exits with code 0 (never hard-fails the workflow).
 *   Sets GitHub Actions output `files_changed` = 'true' if anything changed.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');

// ── Local dev: load .env from repo root if not running inside GitHub Actions ──
// On GitHub Actions, GEMINI_API_KEY is injected via secrets — no .env needed.
// Locally, create/use the .env file at the repo root (it is gitignored).
if (!process.env.GITHUB_ACTIONS) {
    const envFile = path.join(__dirname, '..', '..', '.env');
    if (fs.existsSync(envFile)) {
        const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;   // skip blanks/comments
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (key && !process.env[key]) process.env[key] = val; // don't override shell env
        }
        console.log('🔑 Local run: loaded GEMINI_API_KEY from .env');
    } else {
        console.warn('⚠️  Local run: no .env file found at repo root. Set GEMINI_API_KEY manually.');
    }
}

// ── Paths ─────────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..', '..');
const CARDS_JS = path.join(ROOT, 'js', 'cards.js');
const CARDS_JSON = path.join(ROOT, 'data', 'CARDS_DATA.json');
const ANNOTATIONS = path.join(ROOT, 'js', 'cards-annotations.js');
const CONFIG = path.join(ROOT, 'js', 'config-filters.js');

// ── Config ────────────────────────────────────────────────────────────────────
// NOTE: RoyaleAPI serves their data via GitHub Pages, NOT raw.githubusercontent.com.
// Confirmed working: https://royaleapi.github.io/cr-api-data/json/cards.json
const ROYALE_URL = 'https://royaleapi.github.io/cr-api-data/json/cards.json';
const CDN_HOST = 'royaleapi.github.io';
// ── Gemini model fallback chain ──────────────────────────────────────────────
// Tried in order. Falls through to the next if a model returns:
//   • 404 Not Found   — model deprecated / removed from this API version
//   • 429 limit:0     — model not on free tier for this key (billing required)
// The chain is ordered: cheapest free-tier models first, paid models last.
// At 4 calls/week, even the paid model costs <$0.01/month.
const GEMINI_MODELS = [
    'gemini-2.5-flash',          // Primary: stable free-tier model (official ID as of 2026-02)
    'gemini-2.5-flash-lite',     // Fallback: lighter 2.5 variant if available
    'gemini-2.0-flash-lite',     // Fallback: older free-tier model (now deprecated by Google)
    'gemini-2.0-flash',          // Last resort: deprecated, may require billing
];
const CDN_BATCH = 15; // concurrent HEAD requests (polite to CDN)

// ═════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═════════════════════════════════════════════════════════════════════════════

/** Slugify a card name for CDN URL: "P.E.K.K.A" → "pekka", "Mini P.E.K.K.A" → "mini-pekka" */
function toSlug(name) {
    return name
        .toLowerCase()
        .replace(/['.]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

/** Escape a string for use inside a RegExp */
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * GET → parsed JSON, with automatic redirect following (up to 5 hops).
 * Node's built-in https.get does NOT follow 301/302 redirects automatically.
 * GitHub renamed branches from 'master' → 'main', causing redirects.
 */
function fetchJson(url, redirects = 0) {
    if (redirects > 5) return Promise.reject(new Error(`Too many redirects for ${url}`));
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            // Follow redirects (301 Moved Permanently, 302 Found, 307/308 Temporary/Permanent)
            if ((res.statusCode === 301 || res.statusCode === 302 ||
                res.statusCode === 307 || res.statusCode === 308) && res.headers.location) {
                res.resume(); // Drain the socket so it can be reused
                resolve(fetchJson(res.headers.location, redirects + 1));
                return;
            }
            if (res.statusCode < 200 || res.statusCode >= 300) {
                res.resume();
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                return;
            }
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error(`JSON parse failed for ${url}: ${e.message}\nFirst 200 chars: ${data.slice(0, 200)}`)); }
            });
        }).on('error', reject);
    });
}

/** HEAD request → true if resource exists (2xx), false otherwise */
function headExists(host, urlPath) {
    return new Promise(resolve => {
        const req = https.request({ hostname: host, path: urlPath, method: 'HEAD' }, res => {
            resolve(res.statusCode >= 200 && res.statusCode < 300);
        });
        req.on('error', () => resolve(false));
        req.setTimeout(8000, () => { req.destroy(); resolve(false); });
        req.end();
    });
}

/** POST JSON → parsed JSON (extraHeaders are merged into the request) */
function postJson(url, payload, extraHeaders = {}) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const opts = new URL(url);
        const req = https.request({
            hostname: opts.hostname,
            path: opts.pathname + opts.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                ...extraHeaders,
            },
        }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error(`Gemini parse failed: ${e.message}`)); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

/** Run async tasks in batches of `size` to avoid hammering remote servers */
async function batchedAll(items, asyncFn, size) {
    const results = [];
    for (let i = 0; i < items.length; i += size) {
        const chunk = items.slice(i, i + size);
        results.push(...await Promise.all(chunk.map(asyncFn)));
    }
    return results;
}

/** Sleep for N milliseconds */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Call Gemini with automatic model fallback and 429 retry.
 *
 * Fallback triggers on:
 *   - 404: model deprecated / not found on this API version
 *   - 429 with quota limit = 0: model not on free tier (billing required)
 *
 * Retry (same model) triggers on:
 *   - 429 with an actual retryDelay: transient per-minute rate limit — waits then retries
 */
async function callGemini(promptText, modelIdx = 0, attempt = 1) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');
    if (modelIdx >= GEMINI_MODELS.length) {
        throw new Error(`All Gemini models exhausted. Tried: ${GEMINI_MODELS.join(', ')}. Check your API key quota at https://ai.dev/rate-limit`);
    }

    const model = GEMINI_MODELS[modelIdx];
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { response_mime_type: 'application/json', temperature: 0 },
    };

    const result = await postJson(url, payload, { 'x-goog-api-key': apiKey });
    const errCode = result?.error?.code;
    const errMsg = result?.error?.message ?? '';

    // ── 404: model not available → fall through to next model ────────────────
    if (errCode === 404) {
        console.log(`    ⚠️  Model "${model}" not found (404) — trying next fallback...`);
        return callGemini(promptText, modelIdx + 1, 1);
    }

    // ── 429: rate limited ────────────────────────────────────────────────────
    if (errCode === 429) {
        const retryDetail = result?.error?.details?.find(d => d['@type']?.includes('RetryInfo'));
        const delayStr = retryDetail?.retryDelay;
        const delaySecs = delayStr ? Math.ceil(parseFloat(delayStr)) + 5 : null;

        // If quota limit is 0, this model is billing-only on this key — skip it
        const quotaIsZero = errMsg.includes('limit: 0');
        if (quotaIsZero) {
            console.log(`    ⚠️  Model "${model}" requires billing (free-tier quota = 0) — trying next fallback...`);
            return callGemini(promptText, modelIdx + 1, 1);
        }

        // Otherwise it's a real per-minute rate limit — wait and retry same model
        if (attempt <= 3) {
            const waitSecs = delaySecs ?? 65; // default 65s if no retryDelay given
            console.log(`    ⏳ Rate limited (429) on "${model}". Waiting ${waitSecs}s before retry ${attempt}/3...`);
            await sleep(waitSecs * 1000);
            return callGemini(promptText, modelIdx, attempt + 1);
        }

        // After 3 retries on same model, try the next one
        console.log(`    ⚠️  "${model}" still rate-limited after 3 retries — trying next fallback...`);
        return callGemini(promptText, modelIdx + 1, 1);
    }

    // ── Success ──────────────────────────────────────────────────────────────
    if (modelIdx > 0) {
        console.log(`    ✅ Using fallback model: "${model}"`);
    }
    const raw = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error(`Unexpected Gemini response from "${model}": ${JSON.stringify(result)}`);

    return JSON.parse(raw.replace(/```json|```/g, '').trim());
}

// ═════════════════════════════════════════════════════════════════════════════
// CDN PROBES
// ═════════════════════════════════════════════════════════════════════════════

/** Probe CDN for a hero skin image for a card */
async function probeHasHero(cardName) {
    const slug = toSlug(cardName);
    const urlPath = `/cr-api-assets/cards/${slug}-hero.png`;
    return headExists(CDN_HOST, urlPath);
}

/** 
 * Probe CDN for an evolution image for a card.
 * Nuclear Fix: CDN is the only source of truth for assets.
 */
async function probeHasEvo(cardName) {
    const slug = toSlug(cardName);
    const urlPath = `/cr-api-assets/cards/${slug}-ev1.png`;
    return headExists(CDN_HOST, urlPath);
}

// ═════════════════════════════════════════════════════════════════════════════
// FILE PATCHERS: NEW CARDS
// ═════════════════════════════════════════════════════════════════════════════

function patchCardsJs(card, info) {
    let src = fs.readFileSync(CARDS_JS, 'utf8');
    const entry =
        `    { name: "${card.name}", rarity: "${card.rarity}", elixir: ${card.elixir ?? 0}, ` +
        `type: "${card.type}", target: "${info.target}", hasEvo: ${info.hasEvo}, ` +
        `hasHero: ${info.hasHero}, flying: ${info.flying}, isGoblin: ${info.isGoblin}, ` +
        `isUndead: ${info.isUndead}, isMan: ${info.isMan}, isHuman: ${info.isHuman} },`;

    const updated = src.replace(/(\n];[\r]?\n?)$/, `\n${entry}\n];\n`);
    if (updated === src) {
        const idx = src.lastIndexOf('];');
        if (idx === -1) throw new Error('cards.js: cannot find closing ];');
        fs.writeFileSync(CARDS_JS, src.slice(0, idx) + `    ${entry}\n` + src.slice(idx), 'utf8');
    } else {
        fs.writeFileSync(CARDS_JS, updated, 'utf8');
    }
    console.log(`    ✅ cards.js`);
}

function patchCardsJson(card, info) {
    const data = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf8'));
    data.push({
        name: card.name, rarity: card.rarity, elixir: card.elixir ?? 0,
        type: card.type, target: info.target, hasEvo: info.hasEvo,
        hasHero: info.hasHero, flying: info.flying, isGoblin: info.isGoblin,
        isUndead: info.isUndead, isMan: info.isMan, isHuman: info.isHuman,
    });
    fs.writeFileSync(CARDS_JSON, JSON.stringify(data, null, 2), 'utf8');
    console.log(`    ✅ CARDS_DATA.json`);
}

function patchAnnotations(card, info) {
    let src = fs.readFileSync(ANNOTATIONS, 'utf8');
    const entry =
        `    "${card.name}": { hasHero: ${info.hasHero}, isGoblin: ${info.isGoblin}, ` +
        `isUndead: ${info.isUndead}, isMan: ${info.isMan}, isHuman: ${info.isHuman} },`;

    const label = (card.elixir > 0) ? `// ── ${card.elixir} Elixir` : '// ── Variable / 0 Elixir';
    const sectionIdx = src.indexOf(label);

    if (sectionIdx !== -1) {
        const nextSection = src.indexOf('\n    // ── ', sectionIdx + 1);
        const closingBrace = src.indexOf('\n};');
        const insertBefore = (nextSection !== -1 && nextSection < closingBrace)
            ? nextSection : closingBrace;
        if (insertBefore === -1) throw new Error('cards-annotations.js: no insertion point');
        src = src.slice(0, insertBefore) + '\n' + entry + src.slice(insertBefore);
    } else {
        const closingIdx = src.lastIndexOf('\n};');
        if (closingIdx === -1) throw new Error('cards-annotations.js: no closing };');
        src = src.slice(0, closingIdx) +
            `\n\n    ${label} ─────────────────────────────────────────────────────────────\n` +
            entry + src.slice(closingIdx);
    }
    fs.writeFileSync(ANNOTATIONS, src, 'utf8');
    console.log(`    ✅ cards-annotations.js`);
}

function patchConfigFilters(card, info) {
    if (!info.isSwarm && !info.isTank && !info.isSpawner) {
        console.log(`    ℹ️  config-filters.js — no role changes`);
        return;
    }
    let src = fs.readFileSync(CONFIG, 'utf8');

    function insertIntoSet(setName, name) {
        const setStart = src.indexOf(`const ${setName}`);
        if (setStart === -1) { console.warn(`    ⚠️  ${setName} not found`); return; }
        const setEnd = src.indexOf(']);', setStart);
        if (setEnd === -1) { console.warn(`    ⚠️  end of ${setName} not found`); return; }
        const marker = src.indexOf('// ── Add new', setStart);
        const insertAt = (marker !== -1 && marker < setEnd) ? marker : setEnd;
        const lineStart = src.lastIndexOf('\n', insertAt);
        src = src.slice(0, lineStart + 1) + `    '${name}',\n` + src.slice(lineStart + 1);
    }

    if (info.isSwarm) insertIntoSet('SWARM_CARDS', card.name);
    if (info.isTank) insertIntoSet('TANK_CARDS', card.name);
    if (info.isSpawner) insertIntoSet('SPAWNER_CARDS', card.name);
    fs.writeFileSync(CONFIG, src, 'utf8');
    console.log(`    ✅ config-filters.js (swarm=${info.isSwarm} tank=${info.isTank} spawner=${info.isSpawner})`);
}

// ═════════════════════════════════════════════════════════════════════════════
// FILE PATCHERS: BOOLEAN FLAG FLIPS (false → true)
// ─────────────────────────────────────────────────────────────────────────────
// These only ever flip false → true. A card never loses its evo or hero.
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Flip a boolean field from false → true for a specific card in cards.js.
 * Matches on the card's name line to ensure we're editing the right entry.
 */
function flipFlagInCardsJs(cardName, field) {
    let src = fs.readFileSync(CARDS_JS, 'utf8');
    const nameEsc = escapeRegExp(cardName);
    const fieldEsc = escapeRegExp(field);
    // Match the entry line for this specific card name, then flip the field
    const pattern = new RegExp(`(name:\\s*"${nameEsc}"[^\\n]*?${fieldEsc}:\\s*)false`);
    const updated = src.replace(pattern, '$1true');
    if (updated === src) throw new Error(`cards.js: "${field}" not found for "${cardName}"`);
    fs.writeFileSync(CARDS_JS, updated, 'utf8');
}

/** Flip a boolean field from false → true for a specific card in CARDS_DATA.json */
function flipFlagInCardsJson(cardName, field) {
    const data = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf8'));
    const card = data.find(c => c.name === cardName);
    if (!card) throw new Error(`CARDS_DATA.json: "${cardName}" not found`);
    if (card[field] === undefined) throw new Error(`CARDS_DATA.json: field "${field}" missing on "${cardName}"`);
    card[field] = true;
    fs.writeFileSync(CARDS_JSON, JSON.stringify(data, null, 2), 'utf8');
}

/** Flip a boolean field from false → true for a specific card in cards-annotations.js */
function flipFlagInAnnotations(cardName, field) {
    let src = fs.readFileSync(ANNOTATIONS, 'utf8');
    const nameEsc = escapeRegExp(cardName);
    const fieldEsc = escapeRegExp(field);
    // Match annotation entry line for this card, flip the field on it
    const pattern = new RegExp(`("${nameEsc}":\\s*\\{[^}\\n]*?${fieldEsc}:\\s*)false`);
    const updated = src.replace(pattern, '$1true');
    if (updated === src) throw new Error(`cards-annotations.js: "${field}" not found for "${cardName}"`);
    fs.writeFileSync(ANNOTATIONS, updated, 'utf8');
}

/**
 * Convenience: flip the SAME field in all 3 files atomically.
 * Rolls back (re-reads from disk) if any step fails — avoids partial corruption.
 *
 * @param {string} cardName
 * @param {string} field  — 'hasHero' | 'hasEvo'
 * @param {string} label  — human-readable label for logging
 */
function flipFlagEverywhere(cardName, field, label) {
    // Capture originals for rollback
    const origJs = fs.readFileSync(CARDS_JS, 'utf8');
    const origJson = fs.readFileSync(CARDS_JSON, 'utf8');
    const origAnno = fs.readFileSync(ANNOTATIONS, 'utf8');

    try {
        flipFlagInCardsJs(cardName, field);
        flipFlagInCardsJson(cardName, field);

        // cards-annotations.js only stores hasHero (not hasEvo — that lives in cards.js / CARDS_DATA.json)
        if (field === 'hasHero') {
            flipFlagInAnnotations(cardName, field);
        }

        console.log(`    ✅ ${label}: false → true in all files`);
        return true;
    } catch (err) {
        // Rollback to prevent partial file corruption
        console.error(`    ❌ ${err.message} — rolling back`);
        fs.writeFileSync(CARDS_JS, origJs, 'utf8');
        fs.writeFileSync(CARDS_JSON, origJson, 'utf8');
        fs.writeFileSync(ANNOTATIONS, origAnno, 'utf8');
        return false;
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// CHECK ①: NEW CARDS
// ═════════════════════════════════════════════════════════════════════════════

async function checkForNewCards(apiCards, knownNames) {
    // ── Step 1: cheap pre-filter (saves Gemini calls for obvious cases)
    const OBVIOUS_EVENT_PREFIXES = ['Super ', 'Party ', 'Santa ', 'Lucky ', 'Golden '];
    const EVENT_BLOCKLIST = new Set(['Terry', 'Terryy', 'Raging Prince', 'Raginng Prince', 'Baby Shark']);

    const candidateCards = apiCards.filter(c => {
        if (!c.name) return false;
        if (knownNames.has(c.name)) return false;

        const isBlocklisted = EVENT_BLOCKLIST.has(c.name);
        const hasEventPrefix = OBVIOUS_EVENT_PREFIXES.some(p => c.name.startsWith(p));

        if (isBlocklisted || hasEventPrefix) {
            const reason = isBlocklisted ? 'explicit blocklist' : 'event prefix';
            console.log(`  ⏭️  Pre-filter (${reason}): "${c.name}"`);
            return false;
        }
        return true;
    });

    if (candidateCards.length === 0) {
        console.log('  ✅ No new cards found.');
        return false;
    }

    console.log(`  🔎 ${candidateCards.length} candidate(s) passed pre-filter — verifying with Gemini: ${candidateCards.map(c => c.name).join(', ')}\n`);
    let anyPatched = false;

    for (const card of candidateCards) {
        console.log(`  🃏 ${card.name} (${card.rarity}, ${card.elixir ?? '?'} elixir)`);
        try {
            console.log(`    🔎 Probing CDN assets for "${card.name}"...`);
            const [hasEvo, hasHero] = await Promise.all([
                probeHasEvo(card.name),
                probeHasHero(card.name)
            ]);

            const prompt = `
You are an expert on Clash Royale. I am adding a new card: "${card.name}" (${card.rarity}, ${card.elixir ?? 0} elixir, ${card.type}).
Determine its semantic properties.

Is this a PERMANENT card that players can collect and keep in their main collection (like Knight, Hog Rider, P.E.K.K.A)? 

CRITICAL: 
- If this is a temporary event, seasonal, or challenge-only card (like Terry, Raging Prince, Super Witch, Baby Shark), isPermanent MUST be false.
- Permanent cards are those that can be used in your permanent 1-8 deck in the 'Main Collection' tab. 
- Seasonal variants are NOT permanent.

Return ONLY a JSON object:
{
  "isPermanent": true,  // false if event/seasonal/temporary
  "target": "ground",   // ground, air, buildings, etc.
  "flying": false,      // true if the unit flies (air troop)
  "isGoblin": false,    // true if card is/summons a Goblin
  "isUndead": false,    // true if card is a Skeleton, Zombie, Ghost, etc.
  "isMan": false,       // true if card is a human-like male
  "isHuman": false,     // true if card is any human variant
  "isSwarm": false,     // true if card spawns 3+ units
  "isTank": false,      // true if card has high HP (2000+)
  "isSpawner": false     // true if card is a building that spawns units
}

If isPermanent is false, you may set all other fields to safe defaults.
`.trim();

            const geminiInfo = await callGemini(prompt);

            if (!geminiInfo.isPermanent) {
                console.log(`    ⏭️  Gemini: event/seasonal card — skipping "${card.name}".`);
                continue;
            }

            // Merge CDN probes with Gemini semantic reasoning
            const info = {
                ...geminiInfo,
                hasEvo,
                hasHero
            };
            console.log(`    🦸 hasHero (CDN): ${hasHero}`);
            console.log(`    ⚡ hasEvo (CDN): ${hasEvo}`);
            console.log(`    🤖 Gemini: ${JSON.stringify(geminiInfo)}`);

            patchCardsJs(card, info);
            patchCardsJson(card, info);
            patchAnnotations(card, info);
            patchConfigFilters(card, info);
            anyPatched = true;
        } catch (err) {
            console.error(`    ❌ Failed: ${err.message}`);
        }
    }
    return anyPatched;
}


// ═════════════════════════════════════════════════════════════════════════════
// CHECK ②: HERO SKIN REFRESH  (CDN probes — totally free, zero API usage)
// ─────────────────────────────────────────────────────────────────────────────
// These only ever flip false → true. A card never loses its evo or hero.
// ═════════════════════════════════════════════════════════════════════════════

async function checkForNewHeroSkins(knownNames) {
    const allCards = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf8'));
    const candidates = allCards.filter(c => c.hasHero === false && knownNames.has(c.name));

    if (candidates.length === 0) {
        console.log('  ✅ All existing cards already have heroes (or none to check).');
        return false;
    }

    console.log(`  🔎 Probing CDN for ${candidates.length} cards without heroes...`);

    // Batched HEAD requests — polite to CDN
    const results = await batchedAll(
        candidates,
        async (card) => ({ card, found: await probeHasHero(card.name) }),
        CDN_BATCH
    );

    const newHeroes = results.filter(r => r.found);
    if (newHeroes.length === 0) {
        console.log('  ✅ No new hero skins found on CDN.');
        return false;
    }

    console.log(`  🎉 ${newHeroes.length} card(s) now have hero skins on CDN!`);
    let anyPatched = false;
    for (const { card } of newHeroes) {
        console.log(`  🦸 ${card.name}`);
        if (flipFlagEverywhere(card.name, 'hasHero', 'hasHero')) anyPatched = true;
    }
    return anyPatched;
}

// ═════════════════════════════════════════════════════════════════════════════
// CHECK ③: EVOLUTION REFRESH  (1 Gemini call for ALL cards — very cheap)
// ─────────────────────────────────────────────────────────────────────────────
// These only ever flip false → true. A card never loses its evo or hero.
// ═════════════════════════════════════════════════════════════════════════════

async function checkForNewEvolutions(knownNames) {
    const allCards = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf8'));
    const candidates = allCards.filter(c => c.hasEvo === false && knownNames.has(c.name));

    if (candidates.length === 0) {
        console.log('  ✅ All existing cards already have evolutions tracked.');
        return false;
    }

    console.log(`  🔎 Probing CDN for ${candidates.length} potential new evolutions...`);

    // Batched CDN probes — no LLM, 100% accurate
    const results = await batchedAll(
        candidates,
        async (card) => ({ card, found: await probeHasEvo(card.name) }),
        CDN_BATCH
    );

    const newEvos = results.filter(r => r.found);
    if (newEvos.length === 0) {
        console.log('  ✅ No new evolutions found on CDN.');
        return false;
    }

    console.log(`  🎉 ${newEvos.length} card(s) now have Evolutions on CDN!`);
    let anyPatched = false;
    for (const { card } of newEvos) {
        console.log(`  ⚡ ${card.name}`);
        const origJs = fs.readFileSync(CARDS_JS, 'utf8');
        const origJson = fs.readFileSync(CARDS_JSON, 'utf8');
        try {
            flipFlagInCardsJs(card.name, 'hasEvo');
            flipFlagInCardsJson(card.name, 'hasEvo');
            console.log(`    ✅ hasEvo: false → true in all files`);
            anyPatched = true;
        } catch (err) {
            console.error(`    ❌ ${err.message} — rolling back`);
            fs.writeFileSync(CARDS_JS, origJs, 'utf8');
            fs.writeFileSync(CARDS_JSON, origJson, 'utf8');
        }
    }
    return anyPatched;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════

(async () => {
    try {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🃏  GuessWho CR — Auto Card Update Pipeline');
        console.log(`    ${new Date().toISOString()}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        // Fetch API data + read known local names in parallel
        console.log('📡 Fetching RoyaleAPI card list...');
        const [apiCards, knownNames] = await Promise.all([
            fetchJson(ROYALE_URL),
            Promise.resolve(new Set(
                [...fs.readFileSync(CARDS_JS, 'utf8').matchAll(/name:\s*"([^"]+)"/g)].map(m => m[1])
            )),
        ]);
        console.log(`   API: ${apiCards.length} cards | Local: ${knownNames.size} cards\n`);

        // ── Run all three checks ───────────────────────────────────────────────
        console.log('── CHECK ① : New cards ─────────────────────────────────────');
        const r1 = await checkForNewCards(apiCards, knownNames);

        console.log('\n── CHECK ② : Hero skin refresh (CDN probes, free) ──────────');
        const r2 = await checkForNewHeroSkins(knownNames);

        console.log('\n── CHECK ③ : Evolution refresh (1 Gemini call) ─────────────');
        const r3 = await checkForNewEvolutions(knownNames);

        // ── Report result ─────────────────────────────────────────────────────
        const anyChanged = r1 || r2 || r3;
        core.setOutput('files_changed', anyChanged ? 'true' : 'false');

        console.log('\n═══════════════════════════════════════════════════════════');
        if (anyChanged) {
            if (r1) console.log('  🃏 New cards were added');
            if (r2) console.log('  🦸 Hero skins were updated');
            if (r3) console.log('  ⚡ Evolutions were updated');
            console.log('  → Files will be committed and deployed automatically.');
        } else {
            console.log('  ✅ Everything is up to date. No changes needed.');
        }
        console.log('═══════════════════════════════════════════════════════════');

    } catch (err) {
        console.error('\n❌ Pipeline error:', err.message);
        core.setOutput('files_changed', 'false');
        process.exit(0); // Always exit 0 — never hard-fail the workflow
    }
})();
