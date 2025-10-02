export function parseNumber(v: string | string[] | undefined, fallback = 0) {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) ? n : fallback;
    }