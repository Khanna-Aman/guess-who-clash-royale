/**
 * revert-bad-evos.js
 * ─────────────────────────────────────────────────────────────────────────────
 * NUCLEAR FIX: Restores confirmed evolutions and removes hallucinations.
 * Uses a verified hardcoded list of all 39 card evolutions as of Feb 2026.
 * ─────────────────────────────────────────────────────────────────────────────
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const CARDS_JS = path.join(ROOT, 'cards.js');
const CARDS_JSON = path.join(ROOT, 'CARDS_DATA.json');

// Authoritative list of all 39 card evolutions as of February 2026
const REAL_EVO_CARDS = new Set([
    // 2023
    "Barbarians", "Royal Giant", "Firecracker", "Skeletons", "Mortar",
    "Knight", "Royal Recruits", "Bats", "Archers", "Ice Spirit",
    // 2024
    "Valkyrie", "Bomber", "Wall Breakers", "Tesla", "Zap",
    "Battle Ram", "Wizard", "Goblin Barrel", "Goblin Giant",
    "Goblin Drill", "Goblin Cage", "P.E.K.K.A", "Mega Knight",
    "Electro Dragon", "Musketeer", "Cannon",
    // 2025
    "Dart Goblin", "Lumberjack", "Hunter", "Executioner", "Witch",
    "Inferno Dragon", "Skeleton Barrel", "Furnace", "Baby Dragon",
    "Skeleton Army", "Royal Ghost", "Royal Hogs", "Giant Snowball"
]);

async function main() {
    console.log(`✅ Authoritative list contains ${REAL_EVO_CARDS.size} confirmed evolutions.\n`);

    // ── Fix CARDS_DATA.json ───────────────────────────────────────────────────
    if (!fs.existsSync(CARDS_JSON)) {
        console.error(`❌ File not found: ${CARDS_JSON}`);
        return;
    }
    const data = JSON.parse(fs.readFileSync(CARDS_JSON, 'utf8'));
    let jsonFixed = 0;
    for (const card of data) {
        const shouldHaveEvo = REAL_EVO_CARDS.has(card.name);
        if (card.hasEvo !== shouldHaveEvo) {
            console.log(`  🔄 CARDS_DATA.json: updating "${card.name}" hasEvo: ${card.hasEvo} → ${shouldHaveEvo}`);
            card.hasEvo = shouldHaveEvo;
            jsonFixed++;
        }
    }
    fs.writeFileSync(CARDS_JSON, JSON.stringify(data, null, 4), 'utf8');
    console.log(`\n📄 CARDS_DATA.json: ${jsonFixed} card(s) updated.\n`);

    // ── Fix cards.js ──────────────────────────────────────────────────────────
    if (!fs.existsSync(CARDS_JS)) {
        console.error(`❌ File not found: ${CARDS_JS}`);
        return;
    }
    let src = fs.readFileSync(CARDS_JS, 'utf8');
    let jsFixed = 0;

    src = src.replace(
        /(\{ name: "([^"]+)"[^}]*hasEvo: )(true|false)(,)/g,
        (match, prefix, cardName, currentVal, suffix) => {
            const shouldHaveEvo = REAL_EVO_CARDS.has(cardName);
            const currentBool = currentVal === 'true';
            if (currentBool !== shouldHaveEvo) {
                console.log(`  🔄 cards.js: "${cardName}" hasEvo: ${currentVal} → ${shouldHaveEvo}`);
                jsFixed++;
                return `${prefix}${shouldHaveEvo}${suffix}`;
            }
            return match;
        }
    );
    fs.writeFileSync(CARDS_JS, src, 'utf8');
    console.log(`\n📄 cards.js: ${jsFixed} card(s) corrected.\n`);

    console.log('✅ Done! All hasEvo values now match confirmed 2026 data.');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
