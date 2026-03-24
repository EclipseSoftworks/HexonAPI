import fetch from "node-fetch";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1485400530355224777/DWtytBOfUSYJXipbvYV2-g2YGm6ySaF8clyz_ZnwGFGSbW4vSq6ebgwVnp2N1TkioImM";
const DEFAULT_THUMBNAIL = "https://t3.rbxcdn.com/9fc30fe577bf95e045c9a3d4abaca05d";
const DEFAULT_IMAGE = "https://media.discordapp.net/attachments/1479908190551408660/1485021148671512676/image.png";

async function safeFetchJSON(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        if (!data) return res.status(400).json({ error: "No data received" });

        // --- Fetch Universe ID ---
        const universeData = await safeFetchJSON(`https://apis.roproxy.com/universes/v1/places/${data.placeId}/universe`);
        const universeId = universeData?.universeId || null;

        // --- Fetch Thumbnail ---
        let thumbnail = DEFAULT_THUMBNAIL;
        if (universeId) {
            const thumbData = await safeFetchJSON(`https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&size=256x256&format=Png`);
            thumbnail = thumbData?.data?.[0]?.imageUrl || DEFAULT_THUMBNAIL;
        }

        // --- Fetch Universe Players ---
        let universePlayers = 0;
        if (universeId) {
            const gameData = await safeFetchJSON(`https://games.roproxy.com/v1/games?universeIds=${universeId}`);
            universePlayers = gameData?.data?.[0]?.playing || 0;
        }

        const joinCode = `roblox://experiences/start?placeId=${data.placeId}&gameInstanceId=${data.serverId}`;
        const gamePageLink = `https://www.roblox.com/games/${data.placeId}`;

        // --- Discord Payload ---
        const payload = {
            embeds: [
                {
                    title: "CHASE WILSON FAN CLUB SERVER",
                    description: `[${data.name}](${gamePageLink})`,
                    color: 0x47FF94,
                    thumbnail: { url: thumbnail },
                    image: { url: DEFAULT_IMAGE },
                    fields: [
                        {
                            name: "Creator",
                            value: `Name: ${data.creatorName}\nId: ${data.creatorId}`,
                            inline: false
                        },
                        {
                            name: "Game",
                            value: `Name: ${data.name}\nId: ${data.placeId}\nDescription: ${data.description}\nPlayers in Universe: ${universePlayers}`,
                            inline: false
                        },
                        {
                            name: "Server",
                            value: `Id: ${data.serverId}\nPlayers: ${data.players}/${data.maxPlayers}\nJoin code:\n\`\`\`${joinCode}\`\`\``,
                            inline: false
                        }
                    ]
                }
            ]
        };

        // --- Send to Discord ---
        const discordRes = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!discordRes.ok) {
            const text = await discordRes.text();
            console.error("Discord API error:", text);
            return res.status(500).json({ error: "Failed to send to Discord", details: text });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error("Unhandled API error:", err);
        return res.status(500).json({ error: "Internal server error", message: err.message });
    }
}
