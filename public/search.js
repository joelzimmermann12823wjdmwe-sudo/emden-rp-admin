console.log('🔍 Search.js wird geladen...');

class PlayerSearch {
    constructor() {
        console.log('🔧 PlayerSearch wird erstellt...');
        this.searchInput = document.getElementById('playerSearch');
        this.sidebarSearchInput = document.getElementById('sidebarPlayerSearch');
        this.searchResults = document.getElementById('searchResults');
        this.sidebarSearchResults = document.getElementById('sidebarSearchResults');
        this.debounceTimer = null;
        this.isSearching = false;
        this.init();
    }

    init() {
        console.log('🔧 Initialisiere PlayerSearch...');
        this.setupEventListeners();
        console.log('✅ PlayerSearch initialisiert');
    }

    setupEventListeners() {
        console.log('🔧 Setup Search Event Listeners...');
        
        // Desktop Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value, this.searchResults);
            });
            console.log('✅ Desktop Search Event Listener hinzugefügt');
        } else {
            console.log('❌ Desktop Search Input nicht gefunden!');
        }

        // Mobile Sidebar Search
        if (this.sidebarSearchInput) {
            this.sidebarSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value, this.sidebarSearchResults);
            });
            console.log('✅ Mobile Search Event Listener hinzugefügt');
        } else {
            console.log('❌ Mobile Search Input nicht gefunden!');
        }

        // Click outside to close results
        document.addEventListener('click', (e) => {
            if (this.searchInput && !this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.hideResults(this.searchResults);
            }
            if (this.sidebarSearchInput && !this.sidebarSearchInput.contains(e.target) && !this.sidebarSearchResults.contains(e.target)) {
                this.hideResults(this.sidebarSearchResults);
            }
        });
    }

    handleSearchInput(query, resultsContainer) {
        clearTimeout(this.debounceTimer);
        
        console.log('🔍 Suche:', query);
        
        if (query.length < 2) {
            this.hideResults(resultsContainer);
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query, resultsContainer);
        }, 500);
    }

    async performSearch(query, resultsContainer) {
        if (this.isSearching) return;
        
        this.isSearching = true;
        console.log('🔍 Starte Suche für:', query);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            console.log('📡 API Response Status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const results = await response.json();
            console.log('✅ Suchergebnisse:', results);
            this.displayResults(results, resultsContainer);
        } catch (error) {
            console.error('❌ Search error:', error);
            this.showError('Suche fehlgeschlagen', resultsContainer);
        } finally {
            this.isSearching = false;
        }
    }

    showError(message, container) {
        if (!container) return;
        container.innerHTML = `<div class="search-result-item">${message}</div>`;
        container.style.display = 'block';
    }

    displayResults(players, container) {
        if (!container) return;
        
        console.log('🎯 Zeige Ergebnisse:', players.length);
        
        if (players.length === 0) {
            container.innerHTML = '<div class="search-result-item">Keine Spieler gefunden</div>';
            container.style.display = 'block';
            return;
        }

        container.innerHTML = players.map(player => `
            <div class="search-result-item">
                <img src="${player.avatar || '/api/placeholder-avatar'}" alt="${player.name}">
                <div class="search-result-info">
                    <div class="player-name-row">
                        <h4>${player.name}</h4>
                        ${player.hasVerifiedBadge ? '<i class="fas fa-badge-check verified-badge"></i>' : ''}
                    </div>
                    <div class="player-details">
                        <span class="player-id">ID: ${player.id}</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Click event für alle Result Items
        container.querySelectorAll('.search-result-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectPlayer(players[index]);
            });
        });
        
        container.style.display = 'block';
        console.log('✅ Ergebnisse angezeigt');
    }

    selectPlayer(player) {
        console.log('🎮 Wähle Spieler:', player);
        
        if (window.adminPanel) {
            window.adminPanel.selectPlayer(player);
        } else {
            console.log('❌ AdminPanel nicht gefunden!');
            alert(`Spieler ${player.name} ausgewählt`);
        }
        
        // Clear search inputs
        if (this.searchInput) this.searchInput.value = '';
        if (this.sidebarSearchInput) this.sidebarSearchInput.value = '';
        
        // Hide results
        this.hideResults(this.searchResults);
        this.hideResults(this.sidebarSearchResults);
    }

    hideResults(container) {
        if (container) {
            container.style.display = 'none';
        }
    }
}

// Initialize
console.log('🚀 Starte PlayerSearch...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM ist geladen, erstelle PlayerSearch...');
    window.playerSearch = new PlayerSearch();
    console.log('✅ PlayerSearch erstellt:', window.playerSearch);
});