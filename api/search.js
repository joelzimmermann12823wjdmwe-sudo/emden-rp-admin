// Echte Roblox API Integration
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { q } = req.query;

        if (!q || q.length < 3) {
            return res.status(200).json([]);
        }

        try {
            let players = [];

            // Prüfe ob es eine numerische ID ist
            if (/^\d+$/.test(q)) {
                // Suche nach User ID
                players = await searchByUserId(q);
            } else {
                // Suche nach Username
                players = await searchByUsername(q);
            }

            return res.status(200).json(players);
        } catch (error) {
            console.error('Roblox API Error:', error);
            return res.status(200).json([]);
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};

// Suche nach Username
async function searchByUsername(username) {
    try {
        const response = await fetch(`https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`, {
            headers: {
                'User-Agent': 'Emden-RP-Admin/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Roblox API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            return [];
        }

        // Hole Avatar Bilder für die Ergebnisse
        const playersWithAvatars = await Promise.all(
            data.data.map(async (user) => {
                try {
                    const avatarUrl = await getAvatarThumbnail(user.id);
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        displayName: user.displayName || user.name,
                        avatar: avatarUrl,
                        hasVerifiedBadge: user.hasVerifiedBadge || false
                    };
                } catch (error) {
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        displayName: user.displayName || user.name,
                        avatar: '/api/placeholder-avatar',
                        hasVerifiedBadge: user.hasVerifiedBadge || false
                    };
                }
            })
        );

        return playersWithAvatars;
    } catch (error) {
        console.error('Username search error:', error);
        return [];
    }
}

// Suche nach User ID
async function searchByUserId(userId) {
    try {
        // Direkter User Abruf über ID
        const userResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`, {
            headers: {
                'User-Agent': 'Emden-RP-Admin/1.0'
            }
        });

        if (!userResponse.ok) {
            throw new Error(`User not found: ${userResponse.status}`);
        }

        const userData = await userResponse.json();

        // Hole Avatar Bild
        const avatarUrl = await getAvatarThumbnail(userId);

        return [{
            id: userData.id.toString(),
            name: userData.name,
            displayName: userData.displayName || userData.name,
            avatar: avatarUrl,
            hasVerifiedBadge: userData.hasVerifiedBadge || false
        }];
    } catch (error) {
        console.error('User ID search error:', error);
        return [];
    }
}

// Hole Avatar Thumbnail
async function getAvatarThumbnail(userId) {
    try {
        const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`, {
            headers: {
                'User-Agent': 'Emden-RP-Admin/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`Avatar API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.data && data.data[0] && data.data[0].imageUrl) {
            return data.data[0].imageUrl;
        }

        return '/api/placeholder-avatar';
    } catch (error) {
        console.error('Avatar fetch error:', error);
        return '/api/placeholder-avatar';
    }
}