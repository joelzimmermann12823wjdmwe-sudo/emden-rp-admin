// api/search-roblox.js - FINALE VERSION MIT ROBLOX API PARSING

// Die globale fetch-Funktion wird von Vercel (Node.js Environment) bereitgestellt.
// Ein manuelles require('node-fetch') ist meistens nicht notwendig, aber wenn der Fehler
// weiterhin auftritt, muss node-fetch in package.json und im Skript wie in der 
// vorherigen Antwort beschrieben eingebunden werden. Wir starten mit der sauberen Vercel-Methode.

module.exports = async (req, res) => {
    // Standard CORS Header für den Zugriff vom Frontend
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Behandelt CORS Preflight Anfragen (Muss immer 200 OK zurückgeben)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.query; 
        
        // Regel: Suche muss mindestens 3 Zeichen lang sein
        if (!query || query.length < 3) {
            return res.status(200).json([]); 
        }

        // Offizielle Roblox Users Search API (sucht nach Namen/Anzeige-Namen)
        const ROBLOX_SEARCH_URL = `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(query)}&limit=10`;
        
        // Führt den externen HTTP-Aufruf durch
        const robloxResponse = await fetch(ROBLOX_SEARCH_URL);
        
        if (!robloxResponse.ok) {
            // Fehlerausgabe, wenn die Roblox API selbst nicht antwortet (z.B. HTTP 429 Rate Limit)
            console.error(`Roblox API Fehler: ${robloxResponse.status} ${robloxResponse.statusText}`);
            return res.status(502).json({ error: 'Externer API-Fehler (Roblox)', status: robloxResponse.status });
        }
        
        const data = await robloxResponse.json();
        
        // PARSING: Die tatsächlichen Benutzerdaten liegen im 'data'-Array der Antwort
        const results = data.data 
            ? data.data.map(user => ({ 
                id: user.id.toString(), 
                name: user.name 
            }))
            : []; 

        return res.status(200).json(results);

    } catch (error) {
        console.error("Interner Serverfehler (Search):", error);
        // Gibt dem Frontend eine klare Fehlermeldung
        return res.status(500).json({ error: 'Interner Serverfehler beim Verarbeiten der Suche.' });
    }
};