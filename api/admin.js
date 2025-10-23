const { v4: uuidv4 } = require('uuid');

// SIMULIERTE DATENBANK (wird bei Vercel-Deployment bei Inaktivität zurückgesetzt)
let records = []; 

module.exports = async (req, res) => {
    // CORS Header
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET: Einträge abrufen (mit/ohne playerId Filter)
    if (req.method === 'GET') {
        const { playerId } = req.query; 
        const result = playerId ? records.filter(record => record.playerId === playerId) : records;
        // WICHTIG: Gibt immer ein Array zurück, um Frontend-Fehler zu vermeiden
        return res.status(200).json(result);
    }

    // POST: Neuen Eintrag hinzufügen
    if (req.method === 'POST') {
        try {
            const { type, playerId, playerName, reason, adminName, timestamp } = req.body;
            if (!playerId || !type || !reason) {
                 return res.status(400).json({ success: false, error: 'Pflichtfelder fehlen.' });
            }

            const record = {
                id: uuidv4(), type, playerId, playerName, reason, adminName,
                timestamp: timestamp || new Date().toISOString()
            };

            records.unshift(record); 
            return res.status(200).json({ success: true, record });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    // DELETE: Eintrag löschen
    if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const initialLength = records.length;
            records = records.filter(record => record.id !== id);
            if (records.length === initialLength) {
                return res.status(404).json({ success: false, error: 'Eintrag nicht gefunden.' });
            }
            return res.status(200).json({ success: true, message: 'Eintrag gelöscht.' });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};