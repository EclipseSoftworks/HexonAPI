export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const data = await req.json();
    const { placeId, jobId } = data;

    if (!placeId || !jobId) {
      return new Response(JSON.stringify({ error: "Missing placeId or jobId" }), { status: 400 });
    }

    // 1️⃣ Get universeId
    const universeResp = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    const universeData = await universeResp.json();
    const universeId = universeData.universeId;
    if (!universeId) {
      return new Response(JSON.stringify({ error: "Failed to get universeId" }), { status: 400 });
    }

    // 2️⃣ Get game info
    const gameResp = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
    const gameData = await gameResp.json();
    const gameInfo = gameData.data?.[0];
    if (!gameInfo) {
      return new Response(JSON.stringify({ error: "Failed to get game info" }), { status: 400 });
    }

    const gamename = gameInfo.name;
    const players = gameInfo.playing;

    // 3️⃣ Get game thumbnail
    const thumbResp = await fetch(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${universeId}&size=150x150&format=Png&isCircular=false`);
    const thumbData = await thumbResp.json();
    const Gamethumbnail = thumbData.data?.[0]?.imageUrl || "";

    // 4️⃣ Build join button
    const Joinbutton = `roblox://experiences/start?placeId=${placeId}&gameInstanceId=${jobId}`;

    // 5️⃣ Build final payload
    const dbPayload = {
      gamename,
      players,
      Gamethumbnail,
      Joinbutton
    };

    // 6️⃣ Send to your database API
    await fetch("https://www.isiah.website/api/eclipsedatabase.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "K7f9D4sX2mLpQ8zV6rT1bNjU3wYvA0HqZ5xRkCjF9aE2oP1sL8dM"
      },
      body: JSON.stringify(dbPayload)
    });

    return new Response(JSON.stringify({ message: "Game data saved successfully!" }), { status: 200 });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
