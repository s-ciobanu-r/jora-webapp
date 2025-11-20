export async function POST(req) {
  const body = await req.json();

  // Connect to your n8n workflow
  const N8N_URL = "https://johnbaton.app.n8n.cloud/webhook/jora-chat";

  const n8nResponse = await fetch(N8N_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  // Stream plain text reply
  return new Response(n8nResponse.body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}
