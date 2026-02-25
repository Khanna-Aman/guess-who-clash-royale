/**
 * config-filters.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Community-defined role/category sets used by the game filters.
 *
 * WHY THIS FILE EXISTS:
 *   "Swarm", "Tank", and "Spawner" are meta-game concepts not present in
 *   any official Clash Royale API. They're subjective community classifications
 *   that need to be maintained manually when new cards arrive.
 *
 *   By centralising them here — OUTSIDE of game.js — they become easy to
 *   update without touching any game logic. When a new patch drops:
 *     1. Open this file.
 *     2. Add the new card name to the appropriate Set(s).
 *     3. Done.
 *
 * MAINTENANCE CHECKLIST (run after every CR balance patch):
 *   □ Is the card a swarm (deploys 3+ units or multiples)?  → SWARM_CARDS
 *   □ Is it a high-HP frontline tank?                       → TANK_CARDS
 *   □ Does it continuously spawn additional units?          → SPAWNER_CARDS
 *   □ Does a new slug override need adding to SLUG_OVERRIDES in game.js?
 *   □ Does the new card need an entry in cards-annotations.js?
 *
 * LAST UPDATED: 2026-02-25
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Cards that deploy multiple units simultaneously / are considered swarms.
 * These are matched by c.name in the Swarm filter.
 */
const SWARM_CARDS = new Set([
    'Skeletons',
    'Goblins',
    'Spear Goblins',
    'Bats',
    'Minions',
    'Minion Horde',
    'Goblin Gang',
    'Skeleton Barrel',
    'Rascals',
    'Wall Breakers',
    'Skeleton Army',
    'Royal Recruits',
    'Skeleton Dragons',
    'Barbarians',
    'Elite Barbarians',
    'Royal Hogs',
    // ── Add new swarm cards here ──────────────────────────
]);

/**
 * High-HP frontline cards commonly used as "tanks" in the meta.
 * These are matched by c.name in the Tank filter.
 */
const TANK_CARDS = new Set([
    'Giant',
    'Golem',
    'Lava Hound',
    'P.E.K.K.A',
    'Mega Knight',
    'Electro Giant',
    'Giant Skeleton',
    'Royal Giant',
    'Goblin Giant',
    'Rune Giant',
    'Ice Golem',
    'Elixir Golem',
    'Dark Prince',
    'Prince',
    'Balloon',
    // ── Add new tank cards here ───────────────────────────
]);

/**
 * Cards that continuously spawn additional units during their lifetime.
 * These are matched by c.name in the Spawner filter.
 */
const SPAWNER_CARDS = new Set([
    'Tombstone',
    'Goblin Hut',
    'Barbarian Hut',
    'Furnace',
    'Goblin Cage',
    'Night Witch',
    'Witch',
    'Skeleton King',
    'Goblin Drill',
    'Graveyard',
    'Lava Hound',
    'Golem',
    'Giant Skeleton',
    // ── Add new spawner cards here ────────────────────────
]);
