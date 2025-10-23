module.exports = async (req, res) => {
    // CORS Header
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

        const ROBLOX_SEARCH_URL = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`;
        const robloxResponse = await fetch(ROBLOX_SEARCH_URL);
        
        if (!robloxResponse.ok) {
            // Fehlerhafte Antwort von der Roblox API (z.B. Rate Limit)
            return res.status(502).json({ error: 'Fehler beim Abruf der externen Roblox API.' });
        }
        
        const data = await robloxResponse.json();
        
        // KRITISCHE KORREKTUR: Datenstruktur der Roblox API wird korrekt geparst.
        const results = data.data 
            ? data.data.map(user => ({ id: user.id.toString(), name: user.name }))
            : []; 

        return res.status(200).json(results);

    } catch (error) {
        return res.status(500).json({ error: 'Interner Serverfehler bei der Suche. Prüfe Vercel Logs.' });
    }
};