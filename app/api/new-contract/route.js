export async function POST(req) {
  try {
    const body = await req.json();

    const N8N_URL = "https://johnbaton.app.n8n.cloud/webhook/jora-new-contract";

    const res = await fetch(N8N_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return Response.json(data);

  } catch (err) {
    console.error("NEW CONTRACT API ERROR:", err);
    return Response.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
