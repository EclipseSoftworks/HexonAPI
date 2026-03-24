export default async function handler(req, res) {
    // Allow POST only
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        // Fix body parsing
        const data = typeof req.body === "string"
            ? JSON.parse(req.body)
            : req.body;

        if (!data) {
            return res.status(400).json({ error: "No data received" });
        }

        const webhook = "https://discord.com/api/webhooks/1485400530355224777/DWtytBOfUSYJXipbvYV2-g2YGm6ySaF8clyz_ZnwGFGSbW4vSq6ebgwVnp2N1TkioImM";

        const payload = {
            embeds: [
                {
                    title: "CHASE FAN CLUB SERVER",
                    description: `[${data.name}](https://www.roblox.com/games/${data.placeId})`,
                    color: 0x47FF94,

                    image: {
                        url: "https://media.discordapp.net/attachments/1479908190551408660/1485021148671512676/image.png"
                    },

                    fields: [
                        {
                            name: "Creator",
                            value: `Name: ${data.creatorName}\nId: ${data.creatorId}`,
                            inline: false
                        },
                        {
                            name: "Game",
                            value: `Name: ${data.name}\nId: ${data.placeId}\n${data.description}`,
                            inline: false
                        },
                        {
                            name: "Server",
                            value:
                                `Players: ${data.players}/${data.maxPlayers}\n` +
                                `JobId: ${data.jobId}\n` +
                                "```" + data.joinCode + "```",
                            inline: false
                        }
                    ]
                }
            ]
        };

        const discordRes = await fetch(webhook, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!discordRes.ok) {
            const text = await discordRes.text();
            return res.status(500).json({ error: text });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("API ERROR:", err);
        return res.status(500).json({ error: err.message });
    }
}
