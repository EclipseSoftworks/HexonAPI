import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { placeId, jobId, gameId } = req.body;

      if (!placeId || !jobId || !gameId) {
        return res.status(400).json({ error: "Missing fields" });
      }

      // Discord webhook payload
      const webhookPayload = {
        content: null,
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

      await fetch("https://discord.com/api/webhooks/1455315027123765486/X3HEW7axDRmJuoBL4REgWUVt-GJ5DJFczOXTf3J6q2s4XDE54LHllTf_H6l9ZPee616g", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload)
      });

      res.status(200).json({ message: "Sent to Discord!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
