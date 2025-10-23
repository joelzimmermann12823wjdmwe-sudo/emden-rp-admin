// api/admin.js - BACKEND LOGIK MIT DISCORD WEBHOOK

const { v4: uuidv4 } = require('uuid'); // Benötigt "uuid" in package.json

// 🚨 WICHTIG: ERSETZE DIESEN PLATZHALTER MIT DEINEM ECHTEN DISCORD WEBHOOK URL
// (Ihre gesendete URL wurde hier aus Sicherheitsgründen entfernt, fügen Sie sie wieder ein!)
const DISCORD_WEBHOOK_URL = 'https://ptb.discord.com/api/webhooks/1430607830221721704/t5SRxTWH6s4MBjINU3X0t_c8eO4lWPDLSQ6wQzqp5VBG4TtCofhnztbdRywn2uefHOe2'; 

// SIMULIERTE DATENBANK (wird bei jedem Vercel-Deployment neu gestartet)
let records = []; 

// Funktion zum Senden der Aktion an Discord
async function sendToDiscord(record) {
    if (DISCORD_WEBHOOK_URL.includes('https://ptb.discord.com/api/webhooks/1430607830221721704/t5SRxTWH6s4MBjINU3X0t_c8eO4lWPDLSQ6wQzqp5VBG4TtCofhnztbdRywn2uefHOe2') || !DISCORD_WEBHOOK_URL) {
        console.warn('Discord Webhook URL ist nicht konfiguriert.');
        return;
    }
    
    let color; // Definiert die Farbe des Discord Embeds
    switch (record.type) {
        case 'Mündlicher Warn': color = 0x3498db; break;
        case 'Warn': color = 0xf1c40f; break;
        case 'Kick': color = 0xe67e22; break;
        case 'Tagesban': color = 0xe74c3c; break;
        case 'Ban': color = 0xc0392b; break;
        default: color = 0x95a5a6;
    }

    const embed = {
        title: `🚨 Neue Admin-Aktion: ${record.type}`,
        color: color,
        fields: [
            { name: "👤 Zielspieler", value: `${record.playerName} (ID: ${record.playerId})`, inline: true },
            { name: "🛡️ Admin", value: record.adminName, inline: true },
            { name: "\u200B", value: "\u200B", inline: false }, 
            { name: "📝 Grund", value: `\`\`\`${record.reason}\`\`\``, inline: false },
        ],
        timestamp: record.timestamp,
        footer: { text: "Nordstadt RP Protokoll-System" }
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.error('Fehler beim Webhook-Aufruf:', error);
    }
}


module.exports = async (req, res) => {
    // CORS Header und OPTIONS Handler
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST');
    if (req.method === 'OPTIONS') return res.status(200).end();

    // GET: Historie abrufen
    if (req.method === 'GET') {
        const { playerId } = req.query; 
        const result = playerId ? records.filter(record => record.playerId === playerId) : records;
        return res.status(200).json(result);
    }

    // POST: Neuen Eintrag hinzufügen und Webhook senden
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
            await sendToDiscord(record); // Webhook senden

            return res.status(200).json({ success: true, record });
        } catch (error) {
            console.error("POST Error:", error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    // DELETE: Eintrag löschen
    if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const initialLength = records.length;
            records = records.filter(record => record.id !== id);
            if (records.length === initialLength) return res.status(404).json({ success: false, error: 'Eintrag nicht gefunden.' });
            return res.status(200).json({ success: true, message: 'Eintrag gelöscht.' });
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};