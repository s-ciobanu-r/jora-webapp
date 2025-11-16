export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const telegram_id = searchParams.get("telegram_id");

  const res = await fetch(
    `https://YOUR-N8N/webhook/jora-get-session?telegram_id=${telegram_id}`
  );

  const data = await res.json();
  return Response.json(data);
}