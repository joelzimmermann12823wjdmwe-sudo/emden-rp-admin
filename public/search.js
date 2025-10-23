class PlayerSearch {
    constructor() {
        this.searchInput = document.getElementById('playerSearch');
        this.searchResults = document.getElementById('searchResults');
        this.debounceTimer = null;
        this.isSearching = false;
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
            if (this.searchInput.value.length > 0 && this.searchResults.innerHTML) {
                this.searchResults.style.display = 'block';
            }
        });

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideResults();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.hideResults();
            }
        });
    }

    handleSearchInput(query) {
        clearTimeout(this.debounceTimer);
        
        // Zeige "Suche..." an während wir warten
        if (query.length >= 2 && !this.isSearching) {
            this.showLoading();
        }

        if (query.length < 2) {
            this.hideResults();
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query);
        }, 500);
    }

    async performSearch(query) {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.showLoading();

        try {
            const response = await fetch(`${window.adminPanel.apiBase}/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const results = await response.json();
            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Suche fehlgeschlagen. Bitte versuche es erneut.');
        } finally {
            this.isSearching = false;
        }
    }

    showLoading() {
        this.searchResults.innerHTML = `
            <div class="search-result-item loading-item">
                <div class="loading-spinner"></div>
                <span>Suche bei Roblox...</span>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }

    showError(message) {
        this.searchResults.innerHTML = `
            <div class="search-result-item error-item">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        this.searchResults.style.display = 'block';
    }

    displayResults(players) {
        this.searchResults.innerHTML = '';

        if (players.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <i class="fas fa-search"></i>
                    <span>Keine Spieler gefunden</span>
                </div>
            `;
            this.searchResults.style.display = 'block';
            return;
        }

        players.forEach(player => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <img src="${player.avatar}" alt="${player.name}" 
                     onerror="this.src='/api/placeholder-avatar'">
                <div class="search-result-info">
                    <div class="player-name-row">
                        <h4>${player.name}</h4>
                        ${player.hasVerifiedBadge ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                    </div>
                    <div class="player-details">
                        <span class="display-name">${player.displayName}</span>
                        <span class="player-id">ID: ${player.id}</span>
                    </div>
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
        this.searchInput.value = player.name; // Zeige den Namen weiterhin an
        this.hideResults();
    }

    hideResults() {
        this.searchResults.style.display = 'none';
    }
}

// Initialize search
document.addEventListener('DOMContentLoaded', () => {
    new PlayerSearch();
});