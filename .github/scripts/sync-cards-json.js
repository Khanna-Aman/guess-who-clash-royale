/**
 * sync-cards-json.js
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE-TIME backfill script.
 * 
 * Problem: CARDS_DATA.json is missing the `flying` field on all existing cards.
 * cards.js (the runtime source of truth) has `flying` on every entry.
 * 
 * This script:
 *   1. Reads every card from cards.js (via regex extraction)
 *   2. Reads CARDS_DATA.json
 *   3. For each card in CARDS_DATA.json, injects the `flying` value from cards.js
 *   4. Writes the corrected CARDS_DATA.json back with consistent field ordering
 * 
 * Run ONCE from repo root:
 *   node .github/scripts/sync-cards-json.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const CARDS_JS = path.join(ROOT, 'cards.js');
const CARDS_JSON = path.join(ROOT, 'CARDS_DATA.json');

// ── Step 1: Extract all card entries from cards.js ───────────────────────────
const jsSrc = fs.readFileSync(CARDS_JS, 'utf8');

// Find all inline card objects like: { name: "X", rarity: "Y", ..., flying: true/false, ... }
const cardLineRegex = /\{\s*name:\s*"([^"]+)"[^}]+flying:\s*(true|false)[^}]*\}/g;

const flyingMap = new Map();
let match;
while ((match = cardLineRegex.exec(jsSrc)) !== null) {
    const name = match[1];
    const flying = match[2] === 'true';
    flyingMap.set(name, flying);
}

console.log(`📋 Extracted flying flags for ${flyingMap.size} cards from cards.js`);

// ── Step 2: Read and patch CARDS_DATA.json ───────────────────────────────────
const data = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf8'));

let patched = 0;
let missing = 0;

const updated = data.map(card => {
    if (typeof card.flying === 'boolean') {
        // Already has it — leave untouched
        return card;
    }

    const flying = flyingMap.get(card.name);
    if (flying === undefined) {
        console.warn(`  ⚠️  No flying value found in cards.js for: "${card.name}"`);
        missing++;
        return card; // Leave as-is — don't corrupt unknown cards
    }

    patched++;

    // Return with consistent field order matching CONTRIBUTING.md schema:
    // name, rarity, elixir, type, target, hasEvo, hasHero, flying, isGoblin, isUndead, isMan, isHuman
    return {
        name: card.name,
        rarity: card.rarity,
        elixir: card.elixir,
        type: card.type,
        target: card.target,
        hasEvo: card.hasEvo,
        hasHero: card.hasHero,
        flying: flying,
        isGoblin: card.isGoblin,
        isUndead: card.isUndead,
        isMan: card.isMan,
        isHuman: card.isHuman,
    };
});

// ── Step 3: Write back ───────────────────────────────────────────────────────
fs.writeFileSync(CARDS_JSON, JSON.stringify(updated, null, 4), 'utf8');

console.log(`\n✅ Done!`);
console.log(`   Cards patched with flying field: ${patched}`);
console.log(`   Cards already correct:           ${data.length - patched - missing}`);
if (missing > 0) {
    console.warn(`   ⚠️  Cards with no match in cards.js: ${missing} (check manually)`);
}
console.log(`\n📄 CARDS_DATA.json updated.`);
