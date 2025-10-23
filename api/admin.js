// api/admin.js - Finaler, korrigierter Code für Vercel Serverless Function

const { v4: uuidv4 } = require('uuid');

// ⚠️ SIMULIERTE DATENBANK (In-Memory). Daten gehen bei Neustart verloren.
let records = []; 

module.exports = async (req, res) => {
    // Standard CORS-Header
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ----------------------
    // GET: Alle oder gefilterte Einträge abrufen
    // ----------------------
    if (req.method === 'GET') {
        const { playerId } = req.query; 
        
        if (playerId) {
            // Filterung: Zeige nur Einträge für die spezifische Spieler-ID
            const filteredRecords = records.filter(record => record.playerId === playerId);
            return res.status(200).json(filteredRecords);
        }

        // Standard: Zeige alle Einträge
        return res.status(200).json(records);
    }

    // ----------------------
    // POST: Neuen Eintrag hinzufügen
    // ----------------------
    if (req.method === 'POST') {
        try {
            const { type, playerId, playerName, reason, adminName, timestamp } = req.body;
            
            // Grundlegende Validierung
            if (!playerId || !type || !reason) {
                 return res.status(400).json({ success: false, error: 'Pflichtfelder (Spieler-ID, Typ, Grund) fehlen.' });
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

            records.unshift(record); // Fügt den Eintrag am Anfang hinzu (neueste zuerst)

            return res.status(200).json({ success: true, record });
        } catch (error) {
            console.error('POST Error:', error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    // ----------------------
    // DELETE: Eintrag löschen
    // ----------------------
    if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const initialLength = records.length;
            
            records = records.filter(record => record.id !== id);
            
            // Überprüfe, ob die Anzahl der Einträge abgenommen hat (404-Behandlung)
            if (records.length === initialLength) {
                return res.status(404).json({ success: false, error: 'Eintrag nicht gefunden.' });
            }

            return res.status(200).json({ success: true, message: 'Eintrag erfolgreich gelöscht.' });
        } catch (error) {
            console.error('DELETE Error:', error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    // ----------------------
    // Standard-Antwort bei nicht erlaubter Methode
    // ----------------------
    return res.status(405).json({ error: 'Method not allowed' });
};