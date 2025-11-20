export async function POST(req) {
  try {
    const body = await req.json();

    // ⬇️ change this to your real n8n webhook for webchat
    const N8N_WEBHOOK_URL =
      "https://johnbaton.app.n8n.cloud/webhook/jora-webchat";

    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await n8nRes.json();

    if (!n8nRes.ok || !data || !data.reply) {
      return Response.json(
        { ok: false, error: "No reply from Jora Webchat workflow" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true, reply: data.reply });
  } catch (err) {
    console.error("CHAT API ERROR:", err);
    return Response.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
