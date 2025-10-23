class PlayerSearch {
    constructor() {
        this.searchInput = document.getElementById('playerSearch');
        this.searchResults = document.getElementById('searchResults');
        this.debounceTimer = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.length > 0) {
                this.searchResults.style.display = 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.searchResults.style.display = 'none';
            }
        });
    }

    handleSearchInput(query) {
        clearTimeout(this.debounceTimer);
        
        if (query.length < 2) {
            this.searchResults.style.display = 'none';
            this.searchResults.innerHTML = '';
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 300);
    }

    async performSearch(query) {
        try {
            // Hier würdest du eine echte Roblox API Integration machen
            // Für jetzt simulieren wir die Suche
            const response = await fetch(`${window.adminPanel.apiBase}/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            
            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.displayResults([]);
        }
    }

    displayResults(players) {
        this.searchResults.innerHTML = '';

        if (players.length === 0) {
            this.searchResults.innerHTML = '<div class="search-result-item">Keine Spieler gefunden</div>';
            this.searchResults.style.display = 'block';
            return;
        }

        players.forEach(player => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <img src="${player.avatar}" alt="${player.name}">
                <div class="search-result-info">
                    <h4>${player.name}</h4>
                    <span>ID: ${player.id}</span>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.selectPlayer(player);
            });

            this.searchResults.appendChild(item);
        });

        this.searchResults.style.display = 'block';
    }

    selectPlayer(player) {
        window.adminPanel.selectPlayer(player);
        this.searchInput.value = '';
        this.searchResults.style.display = 'none';
        this.searchResults.innerHTML = '';
    }
}

// Initialize search
document.addEventListener('DOMContentLoaded', () => {
    new PlayerSearch();
});