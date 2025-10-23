class PlayerSearch {
    constructor() {
        this.searchInput = document.getElementById('playerSearch');
        this.sidebarSearchInput = document.getElementById('sidebarPlayerSearch');
        this.searchResults = document.getElementById('searchResults');
        this.sidebarSearchResults = document.getElementById('sidebarSearchResults');
        this.debounceTimer = null;
        this.isSearching = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Desktop Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value, this.searchResults);
            });

            this.searchInput.addEventListener('focus', () => {
                if (this.searchInput.value.length > 0 && this.searchResults.innerHTML) {
                    this.searchResults.style.display = 'block';
                }
            });

            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideResults(this.searchResults);
                }
            });
        }

        // Mobile Sidebar Search
        if (this.sidebarSearchInput) {
            this.sidebarSearchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value, this.sidebarSearchResults);
            });

            this.sidebarSearchInput.addEventListener('focus', () => {
                if (this.sidebarSearchInput.value.length > 0 && this.sidebarSearchResults.innerHTML) {
                    this.sidebarSearchResults.style.display = 'block';
                }
            });

            this.sidebarSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.hideResults(this.sidebarSearchResults);
                }
            });
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
        
        if (query.length >= 2 && !this.isSearching) {
            this.showLoading(resultsContainer);
        }

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
        this.showLoading(resultsContainer);

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const results = await response.json();
            this.displayResults(results, resultsContainer);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Suche fehlgeschlagen. Bitte versuche es erneut.', resultsContainer);
        } finally {
            this.isSearching = false;
        }
    }

    showLoading(container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="search-result-item loading-item">
                <div class="loading-spinner"></div>
                <span>Suche bei Roblox...</span>
            </div>
        `;
        container.style.display = 'block';
    }

    showError(message, container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="search-result-item error-item">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        container.style.display = 'block';
    }

    displayResults(players, container) {
        if (!container) return;
        
        container.innerHTML = '';

        if (players.length === 0) {
            container.innerHTML = `
                <div class="search-result-item no-results">
                    <i class="fas fa-search"></i>
                    <span>Keine Spieler gefunden</span>
                </div>
            `;
            container.style.display = 'block';
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

            container.appendChild(item);
        });

        container.style.display = 'block';
    }

    selectPlayer(player) {
        if (window.adminPanel) {
            window.adminPanel.selectPlayer(player);
        }
        
        if (this.searchInput) this.searchInput.value = '';
        if (this.sidebarSearchInput) this.sidebarSearchInput.value = '';
        
        this.hideResults(this.searchResults);
        this.hideResults(this.sidebarSearchResults);
    }

    hideResults(container) {
        if (container) {
            container.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PlayerSearch();
});