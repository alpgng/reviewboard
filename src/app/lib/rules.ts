export function calculateRisk(amount: number, tags: string[]): number {
    let score = 0;
    if (amount > 10000) score += 50;
    if (tags.includes("urgent")) score += 30;
    if (tags.includes("fintech")) score += 20;
    return Math.min(score, 100);
    }