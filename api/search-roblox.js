// api/search-roblox.js
module.exports = async (req, res) => {
    // CORS Header
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.query; 
        
        if (!query || query.length < 3) {
            return res.status(200).json([]);
        }

        // DIES IST DIE AKTUELLE ÖFFENTLICHE ROBLOX-API FÜR DIE BENUTZERSUCHE
        // Die Funktion ist als Proxy implementiert, damit der Browser nicht direkt auf Roblox zugreifen muss.
        const ROBLOX_SEARCH_URL = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`;
        
        const robloxResponse = await fetch(ROBLOX_SEARCH_URL);
        
        if (!robloxResponse.ok) {
            return res.status(502).json({ error: 'Fehler beim Abruf der Roblox API.' });
        }
        
        const data = await robloxResponse.json();

        // Mappe die Roblox-Antwort auf das benötigte Format {id: "123", name: "Name"}
        const results = data.data.map(user => ({ 
            id: user.id.toString(), 
            name: user.name 
        }));

        return res.status(200).json(results);

    } catch (error) {
        return res.status(500).json({ error: 'Interner Serverfehler bei der Suche.' });
    }
};