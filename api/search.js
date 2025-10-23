// Simulierte Roblox-Suche
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { q } = req.query;

        // Simulierte Spielerdaten - in Produktion mit Roblox API verbinden
        const mockPlayers = [
            {
                id: '123456789',
                name: 'EmdenPlayer1',
                avatar: 'https://via.placeholder.com/150/00a2ff/ffffff?text=EP1'
            },
            {
                id: '987654321', 
                name: 'EmdenPro',
                avatar: 'https://via.placeholder.com/150/764ba2/ffffff?text=EPR'
            },
            {
                id: '456123789',
                name: 'NordseeFan',
                avatar: 'https://via.placeholder.com/150/f39c12/ffffff?text=NF'
            }
        ].filter(player => 
            player.name.toLowerCase().includes(q.toLowerCase())
        );

        return res.status(200).json(mockPlayers);
    }

    return res.status(405).json({ error: 'Method not allowed' });
};