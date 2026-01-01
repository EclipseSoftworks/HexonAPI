export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const data = await req.json();
    const { placeId, jobId, gameId } = data;

    if (!placeId || !jobId || !gameId) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Discord webhook payload
    const webhookPayload = {
      embeds: [
        {
          title: "Game Started",
          color: 0x00ff00,
          fields: [
            { name: "Place ID", value: String(placeId), inline: true },
            { name: "Job ID", value: String(jobId), inline: true },
            { name: "Game ID", value: String(gameId), inline: true }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    // Send to your webhook
    await fetch(
      "https://discord.com/api/webhooks/1455315027123765486/X3HEW7axDRmJuoBL4REgWUVt-GJ5DJFczOXTf3J6q2s4XDE54LHllTf_H6l9ZPee616g",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload)
      }
    );

    return new Response(JSON.stringify({ message: "Sent to Discord!" }), { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
