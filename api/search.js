console.log('🔍 SUPER SIMPLE Search.js wird geladen...');

class SimpleSearch {
    constructor() {
        console.log('🔧 SimpleSearch wird erstellt...');
        this.searchInput = document.getElementById('playerSearch');
        this.init();
    }

    init() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            console.log('✅ SimpleSearch initialisiert');
        }
    }

    handleSearch(query) {
        console.log('🔍 Suche:', query);
        
        if (query.length < 2) {
            this.hideResults();
            return;
        }

        // SUPER EINFACHE TEST DATEN
        const testPlayers = [
            { id: '1', name: 'Builderman', displayName: 'Builderman' },
            { id: '2', name: 'JohnDoe', displayName: 'John' },
            { id: '3', name: 'TestUser', displayName: 'Test' }
        ].filter(player => 
            player.name.toLowerCase().includes(query.toLowerCase())
        );

        console.log('✅ Zeige Ergebnisse:', testPlayers);
        this.showResults(testPlayers);
    }

    showResults(players) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        if (players.length === 0) {
            resultsContainer.innerHTML = '<div>Keine Spieler gefunden</div>';
        } else {
            resultsContainer.innerHTML = players.map(player => `
                <div class="search-result-item" onclick="window.simpleSearch.selectPlayer('${player.name}')">
                    <strong>${player.name}</strong> (ID: ${player.id})
                </div>
            `).join('');
        }
        
        resultsContainer.style.display = 'block';
    }

    hideResults() {
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
    }

    selectPlayer(playerName) {
        console.log('🎮 Wähle Spieler:', playerName);
        alert(`Spieler ${playerName} ausgewählt`);
        this.hideResults();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starte SimpleSearch...');
    window.simpleSearch = new SimpleSearch();
});