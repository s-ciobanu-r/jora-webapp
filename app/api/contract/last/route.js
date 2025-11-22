export async function GET() {
  try {
    const res = await fetch(
      "https://johnbaton.app.n8n.cloud/webhook/jora-last-contract"
    );

    const data = await res.json();

    if (!data.ok) {
      return Response.json({ ok: false });
    }

    return Response.json({
      ok: true,
      contract: data.contract
    });

  } catch (err) {
    console.error("LAST CONTRACT ERROR:", err);
    return Response.json({ ok: false });
  }
}
