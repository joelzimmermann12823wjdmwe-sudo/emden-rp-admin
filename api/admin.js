// api/admin.js
const { v4: uuidv4 } = require('uuid');

// ⚠️ NICHT-PERSISTENTER SPEICHER! Daten gehen bei Neustart verloren.
let records = []; 

module.exports = async (req, res) => {
    // CORS headers für Cross-Origin-Requests
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET: Einträge abrufen (alle oder nach playerId)
    if (req.method === 'GET') {
        const { playerId } = req.query;
        const result = playerId ? records.filter(record => record.playerId === playerId) : records;
        return res.status(200).json(result);
    }

    // POST: Neuen Eintrag hinzufügen
    if (req.method === 'POST') {
        try {
            const { type, playerId, playerName, reason, adminName, timestamp } = req.body;
            if (!playerId || !type || !reason) {
                 return res.status(400).json({ error: 'Pflichtfelder fehlen.' });
            }
            const record = {
                id: uuidv4(),
                type,
                playerId,
                playerName,
                reason,
                adminName,
                timestamp: timestamp || new Date().toISOString()
            };
            records.unshift(record);
            return res.status(200).json({ success: true, record });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
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
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};