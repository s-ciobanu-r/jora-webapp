export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return Response.json({ can_resume: false });
  }

  // Your n8n "get session" webhook
  const N8N_URL = "https://johnbaton.app.n8n.cloud/webhook/jora-get-session";

  const res = await fetch(N8N_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId })
  });

  const data = await res.json();

  return Response.json(data);
}
