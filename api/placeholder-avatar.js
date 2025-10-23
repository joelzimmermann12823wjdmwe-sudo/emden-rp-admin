module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // SVG für den Nordstadt RP Platzhalter-Avatar
    const svg = `<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">\n        <defs>\n            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">\n                <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />\n                <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />\n            </linearGradient>\n        </defs>\n        <rect width="150" height="150" fill="url(#grad)"/>\n        <text x="75" y="80" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">NORDSTADT</text>\n        <text x="75" y="105" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16">ADMIN</text>\n    </svg>`;
    
    res.send(svg);
};