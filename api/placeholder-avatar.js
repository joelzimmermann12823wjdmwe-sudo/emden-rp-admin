// Generiere einen Platzhalter-Avatar
module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 Stunden cache
    
    const svg = `
        <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="150" height="150" fill="url(#grad)"/>
            <text x="75" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">EMDEN</text>
            <text x="75" y="100" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">RP</text>
        </svg>
    `;
    
    res.send(svg);
};