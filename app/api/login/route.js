export async function POST(req) {
  const body = await req.json();

  const res = await fetch("https://johnbaton.app.n8n.cloud/webhook/jora-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!data.success) {
    return Response.json({ success: false });
  }

  return Response.json({
    success: true,
    user_id: data.user_id,
    name: data.name,
    role: data.role
  });
}
