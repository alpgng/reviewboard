export async function sendStatusWebhook(item: {
    id: string;
    title: string;
    status: string;
    risk_score: number;
    amount: number;
    tags: string[];
    }) {
    const url = process.env.WEBHOOK_URL;
    if (!url) return;
    try {
    await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
    type: "status_changed",
    payload: item,
    ts: new Date().toISOString(),
    }),
    });
    } catch (e) {
    console.error("webhook failed", e);
    }
    }