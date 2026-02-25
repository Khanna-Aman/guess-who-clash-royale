/**
 * utils.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Image resolution, string formatting, and common UI utility functions.
 */

const SLUG_OVERRIDES = {
    'pekka': 'pekka',
    'mini-pekka': 'mini-pekka',
    'x-bow': 'x-bow',
    'the-log': 'the-log',
    'berserker': 'berserker',
    'suspicious-bush': 'suspicious-bush',
    'goblin-curse': 'goblin-curse',
    'void': 'void-spell',
};

function toSlug(name) {
    return name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\./g, '')
        .replace(/'/g, '')
        .replace(/,/g, '');
}

function getCardImg(name) {
    let slug = toSlug(name);
    if (SLUG_OVERRIDES[slug]) slug = SLUG_OVERRIDES[slug];
    return `https://royaleapi.github.io/cr-api-assets/cards/${slug}.png`;
}

/** 
 * Fallback mechanism for broken card images.
 */
function handleCardImgError(img, name) {
    if (img.dataset.triedAll) {
        img.classList.add('img-error');
        return;
    }

    const slug = toSlug(name);
    const noHyphen = slug.replace(/-/g, '');
    const underScore = slug.replace(/-/g, '_');

    const variations = [slug, noHyphen, underScore, `${slug}-card`, `${slug}-spell`, `${slug}_card`, `card-${slug}`];
    const cdns = [
        (s) => `https://royaleapi.com/static/img/cards-150/${s}.png`,
        (s) => `https://cdn.statsroyale.com/images/cards/full/${s}.png`,
        (s) => `https://www.deckshop.pro/img/cards/${s}.png`,
        (s) => `https://nexus.elixir.run/clash-royale/cards/${s}.png`
    ];

    let currentIdx = parseInt(img.dataset.fallbackIdx || '0');
    const totalCombos = cdns.length * variations.length;

    if (currentIdx < totalCombos) {
        const cdnIdx = Math.floor(currentIdx / variations.length);
        const varIdx = currentIdx % variations.length;
        img.dataset.fallbackIdx = currentIdx + 1;
        img.src = cdns[cdnIdx](variations[varIdx]);
        console.log(`Fallback effort for "${name}": trying URL index ${currentIdx}`);
    } else {
        img.dataset.triedAll = 'true';
        img.classList.add('img-error');
    }
}

/**
 * Show a non-blocking toast message.
 */
function showToast(msg, type = 'info', duration = 2200) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast${type === 'warn' ? ' toast-warn' : ''}`;
    el.textContent = msg;
    container.appendChild(el);

    setTimeout(() => {
        el.classList.add('toast-out');
        el.addEventListener('animationend', () => el.remove(), { once: true });
    }, duration);
}
