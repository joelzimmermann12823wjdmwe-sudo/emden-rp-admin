// api/search-roblox.js

module.exports = async (req, res) => {
    // CORS Header
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.query; 
        
        if (!query || query.length < 3) {
            // Leere Ergebnisse, wenn Suchanfrage zu kurz
            return res.status(200).json([]);
        }

        // 🚨 PASSE DIESE URL AN DIE AKTUELLE ROBLOX USER SEARCH API AN!
        // Aktuelle öffentliche Roblox-API-URL für die Suche nach Spielern
        const ROBLOX_SEARCH_URL = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`;
        
        const robloxResponse = await fetch(ROBLOX_SEARCH_URL);
        
        if (!robloxResponse.ok) {
            console.error(`Roblox API responded with status: ${robloxResponse.status}`);
            return res.status(502).json({ error: 'Fehler beim Abruf der Roblox API.' });
        }
        
        const data = await robloxResponse.json();

        // Extrahiere die relevanten Daten: {id: 123, name: "Name"}
        const results = data.data.map(user => ({ 
            id: user.id.toString(), 
            name: user.name 
        }));

        return res.status(200).json(results);

    } catch (error) {
        console.error('Roblox Search Error:', error);
        return res.status(500).json({ error: 'Interner Serverfehler bei der Suche.' });
    }
};