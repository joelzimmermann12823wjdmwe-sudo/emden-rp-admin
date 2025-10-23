const { v4: uuidv4 } = require('uuid');

// SIMULIERTE DATENBANK (wird bei Vercel-Deployment bei Inaktivität zurückgesetzt)
let records = []; 

module.exports = async (req, res) => {
    // CORS Header für Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET: Einträge abrufen (mit/ohne playerId Filter)
    if (req.method === 'GET') {
        // WICHTIG: Die API muss immer 200 OK und ein Array zurückgeben, 
        // auch wenn es leer ist, um den Frontend-Fehler zu vermeiden.
        const { playerId } = req.query; 
        const result = playerId ? records.filter(record => record.playerId === playerId) : records;
        return res.status(200).json(result); 
    }
    // ... (restliche POST/DELETE Logik)
    // ...
    // ...
    return res.status(405).json({ error: 'Method not allowed' });
};