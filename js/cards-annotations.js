/**
 * cards-annotations.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MANUAL community-maintained layer of card metadata.
 *
 * WHY THIS EXISTS:
 *   The core card facts (name, elixir, rarity, type, target, flying, hasEvo)
 *   can be sourced from the official Clash Royale API or community JSON repos
 *   and auto-updated by a script.
 *
 *   THIS file contains facts that NO official API provides — lore classifications,
 *   visual identifiers, hero skin existence, and community meta roles.
 *   It MUST be updated manually whenever a new card is released.
 *
 * HOW TO MERGE (see game.js init()):
 *   CARDS = mergeCoreAndAnnotations(CARDS_CORE_JSON, CARD_ANNOTATIONS);
 *
 * FORMAT:
 *   Key   = exact card name (case-sensitive, must match cards-core.js)
 *   Value = annotation object — any field here overrides / extends the core card
 *
 * LAST UPDATED: 2026-02-25
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* eslint-disable quote-props */
const CARD_ANNOTATIONS = {
    // ── 1 Elixir ──────────────────────────────────────────────────────────────
    "Skeletons": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Electro Spirit": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Fire Spirit": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Ice Spirit": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Heal Spirit": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 2 Elixir ──────────────────────────────────────────────────────────────
    "Goblins": { hasHero: true, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Spear Goblins": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Bomber": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Bats": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Zap": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Giant Snowball": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Berserker": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Ice Golem": { hasHero: true, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Suspicious Bush": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Barbarian Barrel": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Wall Breakers": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Goblin Curse": { hasHero: false, isGoblin: true, isUndead: false, isMan: false, isHuman: false },
    "Rage": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "The Log": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 3 Elixir ──────────────────────────────────────────────────────────────
    "Archers": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Arrows": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Knight": { hasHero: true, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Minions": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    "Cannon": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Goblin Gang": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Skeleton Barrel": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Firecracker": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Royal Delivery": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Tombstone": { hasHero: false, isGoblin: false, isUndead: true, isMan: false, isHuman: false },
    "Mega Minion": { hasHero: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    "Dart Goblin": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Earthquake": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Elixir Golem": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Goblin Barrel": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Guards": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Skeleton Army": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Vines": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Clone": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Tornado": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Void": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Miner": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Princess": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Ice Wizard": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Royal Ghost": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: true },
    "Bandit": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Fisherman": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Little Prince": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },

    // ── 4 Elixir ──────────────────────────────────────────────────────────────
    "Skeleton Dragons": { hasHero: false, isGoblin: false, isUndead: true, isMan: false, isHuman: false },
    "Mortar": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Tesla": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Fireball": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Mini P.E.K.K.A": { hasHero: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    "Musketeer": { hasHero: true, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Goblin Cage": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Goblin Hut": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Valkyrie": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Battle Ram": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Bomb Tower": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Flying Machine": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Hog Rider": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Battle Healer": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Furnace": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Zappies": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Goblin Demolisher": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Baby Dragon": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    "Dark Prince": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Freeze": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Poison": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Rune Giant": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Hunter": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Goblin Drill": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Electro Wizard": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Inferno Dragon": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    "Phoenix": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Magic Archer": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Lumberjack": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Night Witch": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Mother Witch": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Golden Knight": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Skeleton King": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Mighty Miner": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },


    // ── 5 Elixir ──────────────────────────────────────────────────────────────
    "Barbarians": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Minion Horde": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    "Rascals": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Giant": { hasHero: true, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Inferno Tower": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Wizard": { hasHero: true, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Royal Hogs": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Witch": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Balloon": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Prince": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Electro Dragon": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    "Bowler": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Executioner": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Cannon Cart": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Ram Rider": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Graveyard": { hasHero: false, isGoblin: false, isUndead: true, isMan: false, isHuman: false },
    "Goblin Machine": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "Archer Queen": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Goblinstein": { hasHero: false, isGoblin: true, isUndead: true, isMan: true, isHuman: false },
    "Monk": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },

    // ── 6 Elixir ──────────────────────────────────────────────────────────────
    "Royal Giant": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Elite Barbarians": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Rocket": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Barbarian Hut": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Elixir Collector": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Giant Skeleton": { hasHero: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    "Lightning": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Goblin Giant": { hasHero: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    "X-Bow": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Sparky": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Spirit Empress": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    "Boss Bandit": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },

    // ── 7 Elixir ──────────────────────────────────────────────────────────────
    "Royal Recruits": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "P.E.K.K.A": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    "Electro Giant": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Mega Knight": { hasHero: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    "Lava Hound": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 8 Elixir ──────────────────────────────────────────────────────────────
    "Golem": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 9 Elixir ──────────────────────────────────────────────────────────────
    "Three Musketeers": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },

    // ── Variable / 0 Elixir ───────────────────────────────────────────────────
    "Mirror": { hasHero: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
};

/**
 * Merges the auto-updatable core card array with the manual annotations.
 * Any annotation key that matches a card name is merged (shallow) into that card object.
 * Cards with no annotation entry are left unchanged.
 *
 * @param {Array}  coreCards   - Array from cards-core.js (or the legacy cards.js)
 * @param {Object} annotations - CARD_ANNOTATIONS map above
 * @returns {Array} merged card array
 */
function mergeCoreAndAnnotations(coreCards, annotations) {
    return coreCards.map(card => {
        const extra = annotations[card.name];
        if (!extra) {
            // No annotation — warn in dev so missing entries are caught early
            if (typeof console !== 'undefined') {
                console.warn(`[cards-annotations] No annotation found for: "${card.name}"`);
            }
            return card;
        }
        return { ...card, ...extra };
    });
}
// --- NODE.JS EXPORTS ---
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mergeCoreAndAnnotations, CARD_ANNOTATIONS };
}
