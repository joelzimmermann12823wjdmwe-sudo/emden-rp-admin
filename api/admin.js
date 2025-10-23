const { v4: uuidv4 } = require('uuid');

// Simulierte Datenbank (in Produktion durch echte DB ersetzen)
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

    if (req.method === 'GET') {
        return res.status(200).json(records);
    }

    if (req.method === 'POST') {
        try {
            const { type, playerId, playerName, reason, adminName, timestamp } = req.body;
            
            const record = {
                id: uuidv4(),
                type,
                playerId,
                playerName,
                reason,
                adminName,
                timestamp: timestamp || new Date().toISOString()
            };

            records.unshift(record); // Neueste zuerst

            return res.status(200).json({ success: true, record });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            records = records.filter(record => record.id !== id);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};