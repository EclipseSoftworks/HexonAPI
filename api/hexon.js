import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Parse the JSON body safely
    const body = req.body;

    // If Vercel sends raw text, try parsing JSON
    const data = typeof body === "string" ? JSON.parse(body) : body;

    const { placeId, jobId, gameId } = data;

    if (!placeId || !jobId || !gameId) {
      return res.status(400).json({ error: "Missing required fields" });
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

    await fetch(
      "https://discord.com/api/webhooks/1455315027123765486/X3HEW7axDRmJuoBL4REgWUVt-GJ5DJFczOXTf3J6q2s4XDE54LHllTf_H6l9ZPee616g",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload)
      }
    );

    return res.status(200).json({ message: "Sent to Discord!" });
  } catch (err) {
    console.error("Error in serverless function:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
