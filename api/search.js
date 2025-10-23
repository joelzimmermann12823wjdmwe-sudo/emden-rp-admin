// Roblox API Integration
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(200).json([]);
        }

        try {
            // TEST DATEN - Später durch echte Roblox API ersetzen
            const testPlayers = [
                {
                    id: '1',
                    name: 'Builderman',
                    displayName: 'Builderman',
                    avatar: '/api/placeholder-avatar',
                    hasVerifiedBadge: true
                },
                {
                    id: '2',
                    name: 'JohnDoe',
                    displayName: 'John',
                    avatar: '/api/placeholder-avatar',
                    hasVerifiedBadge: false
                },
                {
                    id: '3',
                    name: 'TestUser',
                    displayName: 'Test',
                    avatar: '/api/placeholder-avatar',
                    hasVerifiedBadge: false
                }
            ].filter(player => 
                player.name.toLowerCase().includes(q.toLowerCase()) ||
                player.displayName.toLowerCase().includes(q.toLowerCase())
            );

            return res.status(200).json(testPlayers);
            
        } catch (error) {
            console.error('Search error:', error);
            return res.status(200).json([]);
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};