// Vercel Serverless Function
const { v4: uuidv4 } = require('uuid');

// Einfache In-Memory Storage (für Demo - in Produktion eine Datenbank verwenden)
let storage = {
  bans: [],
  kicks: [],
  warns: []
};

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
    return res.status(200).json(storage);
  }

  if (req.method === 'POST') {
    try {
      const { type, playerName, playerId, reason, adminName } = req.body;
      
      const action = {
        id: uuidv4(),
        type,
        playerName,
        playerId,
        reason,
        adminName,
        timestamp: new Date().toISOString()
      };

      storage[`${type}s`].unshift(action); // Neueste zuerst

      return res.status(200).json({ success: true, action });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};