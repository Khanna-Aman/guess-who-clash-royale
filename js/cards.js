/** CARDS_DATA loaded as a global for file:// compatibility.
 *  Source of truth: CARDS_DATA.json
 *  Extra fields: `flying`, `isGoblin`, `isUndead`, `isMan`, `isHuman`
 */
const CARDS_DATA_JSON = [
    // ── 1 Elixir ──────────────────────────────────────────────────────────────
    { name: "Skeletons", rarity: "Common", elixir: 1, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Electro Spirit", rarity: "Common", elixir: 1, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Fire Spirit", rarity: "Common", elixir: 1, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Ice Spirit", rarity: "Common", elixir: 1, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Heal Spirit", rarity: "Rare", elixir: 1, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 2 Elixir ──────────────────────────────────────────────────────────────
    { name: "Goblins", rarity: "Common", elixir: 2, type: "Troop", target: "Ground", hasEvo: false, hasHero: true, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Spear Goblins", rarity: "Common", elixir: 2, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Bomber", rarity: "Common", elixir: 2, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Bats", rarity: "Common", elixir: 2, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Zap", rarity: "Common", elixir: 2, type: "Spell", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Giant Snowball", rarity: "Common", elixir: 2, type: "Spell", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Berserker", rarity: "Common", elixir: 2, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Ice Golem", rarity: "Rare", elixir: 2, type: "Troop", target: "Buildings", hasEvo: false, hasHero: true, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Suspicious Bush", rarity: "Rare", elixir: 2, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Barbarian Barrel", rarity: "Epic", elixir: 2, type: "Spell", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Wall Breakers", rarity: "Epic", elixir: 2, type: "Troop", target: "Buildings", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Goblin Curse", rarity: "Epic", elixir: 2, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: false, isHuman: false },
    { name: "Rage", rarity: "Epic", elixir: 2, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "The Log", rarity: "Legendary", elixir: 2, type: "Spell", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 3 Elixir ──────────────────────────────────────────────────────────────
    { name: "Archers", rarity: "Common", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Arrows", rarity: "Common", elixir: 3, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Knight", rarity: "Common", elixir: 3, type: "Troop", target: "Ground", hasEvo: true, hasHero: true, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Minions", rarity: "Common", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    { name: "Cannon", rarity: "Common", elixir: 3, type: "Building", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Goblin Gang", rarity: "Common", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Skeleton Barrel", rarity: "Common", elixir: 3, type: "Troop", target: "Buildings", hasEvo: true, hasHero: false, flying: true, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Firecracker", rarity: "Common", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Royal Delivery", rarity: "Common", elixir: 3, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Tombstone", rarity: "Rare", elixir: 3, type: "Building", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: false, isHuman: false },
    { name: "Mega Minion", rarity: "Rare", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: true, flying: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    { name: "Dart Goblin", rarity: "Rare", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Earthquake", rarity: "Rare", elixir: 3, type: "Spell", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Elixir Golem", rarity: "Rare", elixir: 3, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Goblin Barrel", rarity: "Epic", elixir: 3, type: "Spell", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Guards", rarity: "Epic", elixir: 3, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Skeleton Army", rarity: "Epic", elixir: 3, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Vines", rarity: "Epic", elixir: 3, type: "Spell", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Clone", rarity: "Epic", elixir: 3, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Tornado", rarity: "Epic", elixir: 3, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Void", rarity: "Epic", elixir: 3, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Miner", rarity: "Legendary", elixir: 3, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Princess", rarity: "Legendary", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Ice Wizard", rarity: "Legendary", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Royal Ghost", rarity: "Legendary", elixir: 3, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: true },
    { name: "Bandit", rarity: "Legendary", elixir: 3, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Fisherman", rarity: "Legendary", elixir: 3, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Little Prince", rarity: "Champion", elixir: 3, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },

    // ── 4 Elixir ──────────────────────────────────────────────────────────────
    { name: "Skeleton Dragons", rarity: "Common", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: true, isMan: false, isHuman: false },
    { name: "Mortar", rarity: "Common", elixir: 4, type: "Building", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Tesla", rarity: "Common", elixir: 4, type: "Building", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Fireball", rarity: "Rare", elixir: 4, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Mini P.E.K.K.A", rarity: "Rare", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: true, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    { name: "Musketeer", rarity: "Rare", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: true, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Goblin Cage", rarity: "Rare", elixir: 4, type: "Building", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Goblin Hut", rarity: "Rare", elixir: 4, type: "Building", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Valkyrie", rarity: "Rare", elixir: 4, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Battle Ram", rarity: "Rare", elixir: 4, type: "Troop", target: "Buildings", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Bomb Tower", rarity: "Rare", elixir: 4, type: "Building", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Flying Machine", rarity: "Rare", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Hog Rider", rarity: "Rare", elixir: 4, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Battle Healer", rarity: "Rare", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Furnace", rarity: "Rare", elixir: 4, type: "Building", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Zappies", rarity: "Rare", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Goblin Demolisher", rarity: "Rare", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Baby Dragon", rarity: "Epic", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    { name: "Dark Prince", rarity: "Epic", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Freeze", rarity: "Epic", elixir: 4, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Poison", rarity: "Epic", elixir: 4, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Rune Giant", rarity: "Epic", elixir: 4, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Hunter", rarity: "Epic", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Goblin Drill", rarity: "Epic", elixir: 4, type: "Building", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Electro Wizard", rarity: "Legendary", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Inferno Dragon", rarity: "Legendary", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    { name: "Phoenix", rarity: "Legendary", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Magic Archer", rarity: "Legendary", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Lumberjack", rarity: "Legendary", elixir: 4, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Night Witch", rarity: "Legendary", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Mother Witch", rarity: "Legendary", elixir: 4, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Golden Knight", rarity: "Champion", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Skeleton King", rarity: "Champion", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Mighty Miner", rarity: "Champion", elixir: 4, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },

    // ── 5 Elixir ──────────────────────────────────────────────────────────────
    { name: "Barbarians", rarity: "Common", elixir: 5, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Minion Horde", rarity: "Common", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    { name: "Rascals", rarity: "Common", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Giant", rarity: "Rare", elixir: 5, type: "Troop", target: "Buildings", hasEvo: false, hasHero: true, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Inferno Tower", rarity: "Rare", elixir: 5, type: "Building", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Wizard", rarity: "Rare", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: true, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Royal Hogs", rarity: "Rare", elixir: 5, type: "Troop", target: "Buildings", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Witch", rarity: "Epic", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Balloon", rarity: "Epic", elixir: 5, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Prince", rarity: "Epic", elixir: 5, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Electro Dragon", rarity: "Epic", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: true, isHuman: false },
    { name: "Bowler", rarity: "Epic", elixir: 5, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Executioner", rarity: "Epic", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Cannon Cart", rarity: "Epic", elixir: 5, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Ram Rider", rarity: "Legendary", elixir: 5, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Graveyard", rarity: "Legendary", elixir: 5, type: "Spell", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: false, isHuman: false },
    { name: "Goblin Machine", rarity: "Legendary", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: true, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "Archer Queen", rarity: "Champion", elixir: 5, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Goblinstein", rarity: "Champion", elixir: 5, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: true, isUndead: true, isMan: true, isHuman: false },
    { name: "Monk", rarity: "Champion", elixir: 5, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },

    // ── 6 Elixir ──────────────────────────────────────────────────────────────
    { name: "Royal Giant", rarity: "Common", elixir: 6, type: "Troop", target: "Buildings", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Elite Barbarians", rarity: "Common", elixir: 6, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Rocket", rarity: "Rare", elixir: 6, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Barbarian Hut", rarity: "Rare", elixir: 6, type: "Building", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Elixir Collector", rarity: "Rare", elixir: 6, type: "Building", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Giant Skeleton", rarity: "Epic", elixir: 6, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: true, isMan: true, isHuman: false },
    { name: "Lightning", rarity: "Epic", elixir: 6, type: "Spell", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Goblin Giant", rarity: "Epic", elixir: 6, type: "Troop", target: "Buildings", hasEvo: true, hasHero: false, flying: false, isGoblin: true, isUndead: false, isMan: true, isHuman: false },
    { name: "X-Bow", rarity: "Epic", elixir: 6, type: "Building", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Sparky", rarity: "Legendary", elixir: 6, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Spirit Empress", rarity: "Legendary", elixir: 6, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: false, isHuman: true },
    { name: "Boss Bandit", rarity: "Champion", elixir: 6, type: "Troop", target: "Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },

    // ── 7 Elixir ──────────────────────────────────────────────────────────────
    { name: "Royal Recruits", rarity: "Common", elixir: 7, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "P.E.K.K.A", rarity: "Epic", elixir: 7, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },
    { name: "Electro Giant", rarity: "Epic", elixir: 7, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Mega Knight", rarity: "Legendary", elixir: 7, type: "Troop", target: "Ground", hasEvo: true, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: true, isHuman: true },
    { name: "Lava Hound", rarity: "Legendary", elixir: 7, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: true, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 8 Elixir ──────────────────────────────────────────────────────────────
    { name: "Golem", rarity: "Epic", elixir: 8, type: "Troop", target: "Buildings", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false },

    // ── 9 Elixir ──────────────────────────────────────────────────────────────
    { name: "Three Musketeers", rarity: "Rare", elixir: 9, type: "Troop", target: "Air & Ground", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: true },

    // ── Variable / 0 Elixir ───────────────────────────────────────────────────
    { name: "Mirror", rarity: "Epic", elixir: 0, type: "Spell", target: "None", hasEvo: false, hasHero: false, flying: false, isGoblin: false, isUndead: false, isMan: false, isHuman: false }
];

// --- NODE.JS EXPORTS ---
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CARDS_DATA_JSON };
}
