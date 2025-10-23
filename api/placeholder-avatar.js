// api/placeholder-avatar.js
const fs = require('fs');
const path = require('path');

// Pfad zum Platzhalterbild (angenommen, es liegt im public/img Ordner)
const imagePath = path.join(process.cwd(), 'public', 'assets', 'placeholder.png'); 

module.exports = async (req, res) => {
    try {
        // Versucht, die Datei synchron zu lesen
        const image = fs.readFileSync(imagePath);
        
        // Setzt den Content-Type Header auf PNG
        res.setHeader('Content-Type', 'image/png');
        
        // Caching Header (optional, aber empfohlen für statische Bilder)
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        
        // Sendet das Bild als Antwort
        res.status(200).send(image);

    } catch (error) {
        // Wenn die Bilddatei nicht gefunden wird
        console.error("Error loading placeholder image:", error);
        res.status(404).end('Placeholder image not found.');
    }
};