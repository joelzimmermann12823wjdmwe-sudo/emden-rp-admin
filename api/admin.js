// api/admin.js

const { v4: uuidv4 } = require('uuid');

// Simulierte Datenbank (Daten gehen bei Neustart verloren!)
let records = [];

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET: Alle oder gefilterte Einträge abrufen
    if (req.method === 'GET') {
        const { playerId } = req.query;
        
        if (playerId) {
            // Filtern nach Spieler-ID, falls in der Query übergeben
            const filteredRecords = records.filter(record => record.playerId === playerId);
            return res.status(200).json(filteredRecords);
        }

        // Ansonsten alle Einträge (neueste zuerst)
        return res.status(200).json(records);
    }

    // POST: Neuen Eintrag hinzufügen
    if (req.method === 'POST') {
        try {
            const { type, playerId, playerName, reason, adminName, timestamp } = req.body;
            
            if (!playerId || !playerName || !type || !reason) {
                 return res.status(400).json({ error: 'Fehlende Pflichtfelder.' });
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

            records.unshift(record); // Fügt den Eintrag am Anfang hinzu

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
                return res.status(404).json({ error: 'Eintrag nicht gefunden.' });
            }

            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};