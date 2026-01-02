export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const data = await new Promise((resolve, reject) => {
      let body = "";
      req.on("data", chunk => body += chunk.toString());
      req.on("end", () => {
        try { resolve(JSON.parse(body)); }
        catch { reject("Invalid JSON"); }
      });
    });

    const { placeId, jobId } = data;
    if (!placeId || !jobId) return res.status(400).json({ error: "Missing placeId or jobId" });

    // Get universeId
    const universeResp = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    const universeData = await universeResp.json();
    const universeId = universeData.universeId;
    if (!universeId) return res.status(400).json({ error: "Failed to get universeId" });

    // Get game info
    const gameResp = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gameData = await gameResp.json();
    const gameInfo = gameData.data?.[0];
    if (!gameInfo) return res.status(400).json({ error: "Failed to get game info" });

    const gamename = gameInfo.name;
    const players = gameInfo.playing;

    // Get thumbnail
    const thumbResp = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`);
    const thumbData = await thumbResp.json();
    const Gamethumbnail = thumbData.data?.[0]?.imageUrl || "";

    // Join button
    const Joinbutton = `roblox://experiences/start?placeId=${placeId}&gameInstanceId=${jobId}`;

    // Build payload as array with API key
    const dbPayload = {
      apiKey: 'K7f9D4sX2mLpQ8zV6rT1bNjU3wYvA0HqZ5xRkCjF9aE2oP1sL8dM',
      games: [
        { gamename, players, Gamethumbnail, Joinbutton }
      ]
    };

    // Send to database asynchronously
    fetch("https://www.isiah.website/api/eclipsedatabase.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dbPayload)
    })
    .then(r => console.log("Database API response status:", r.status))
    .catch(err => console.error("Failed to send to database:", err));

    return res.status(200).json({ message: "Game data sent to database!" });

  } catch (err) {
    console.error("Hexon API error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.toString() });
  }
}
