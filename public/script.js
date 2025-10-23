// public/script.js - FRONTEND LOGIK (Muss die API-Aufrufe verwenden)

// !!! HIER KEINE 'require' oder 'module.exports' !!!

class AdminPanel {
    constructor() {
        // ... (Ihr bestehender constructor Code) ...
        this.apiBase = '/api'; // Verwendet den korrekten Basis-Pfad
        this.selectedPlayer = null;
        this.currentAdmin = null;
        this.allRecords = [];
        this.init();
    }
    
    // ... (Alle Ihre Helper-Funktionen, init, setupEventListeners etc.) ...

    // --- SPIELER SUCHE LOGIK ---
    async handlePlayerSearch(query, resultsContainer) {
        // ... (Ihre bestehende Logik für die Suche) ...
        try {
            // AUFRUF: /api/search-roblox
            const response = await fetch(`${this.apiBase}/search-roblox?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            // ...
        } catch (error) {
            this.showError('Suche fehlgeschlagen / Server offline (Prüfe API-Datei)', resultsContainer);
        }
    }

    // ... (Ihre displaySearchResults, selectPlayer Funktionen etc.) ...

    // --- DATENVERWALTUNG POST ---
    async submitAction() {
        // ... (Ihre bestehende Logik zum Sammeln der Formulardaten) ...
        try {
            // AUFRUF: /api/admin (POST)
            const response = await fetch(`${this.apiBase}/admin`, {
                method: 'POST',
                // ... (headers und body) ...
            });
            // ...
        } catch (error) {
            alert('Interner Serverfehler beim Speichern.');
        }
    }

    // --- DATENVERWALTUNG GET (Gesamthistorie) ---
    async loadAllRecords(forceReload = false) {
        // ... (Ihre bestehende Logik zum Laden der Gesamthistorie) ...
        try {
            // AUFRUF: /api/admin (GET)
            const response = await fetch(`${this.apiBase}/admin`);
            this.allRecords = await response.json();
            // ...
        } catch (error) {
            this.allRecords = [];
            this.displayError('Fehler beim Laden der Gesamthistorie. (Prüfe admin.js)', document.getElementById('recordsList'));
        }
    }
    
    // ... (Restlicher Code inklusive loadPlayerRecords und handleDeleteRecord) ...
}

// Initialisiere das Panel, sobald das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});