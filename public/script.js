class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.selectedPlayer = null;
        this.pendingDeleteId = null;
        this.currentAdmin = null;
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = false;
        this.init();
    }

    async init() {
        this.detectDeviceType();
        this.setupResponsiveListeners();
        this.checkLogin();
        this.setupEventListeners();
        await this.loadAllRecords();
    }

    detectDeviceType() {
        const width = window.innerWidth;
        
        this.isMobile = width < 768;
        this.isTablet = width >= 768 && width < 1024;
        this.isDesktop = width >= 1024;
        
        document.body.classList.toggle('mobile', this.isMobile);
        document.body.classList.toggle('tablet', this.isTablet);
        document.body.classList.toggle('desktop', this.isDesktop);
        
        console.log(`Device detected: ${this.isMobile ? 'Mobile' : this.isTablet ? 'Tablet' : 'Desktop'}`);
    }

    setupResponsiveListeners() {
        window.addEventListener('resize', () => {
            this.detectDeviceType();
            this.handleResponsiveChanges();
        });
        
        this.handleResponsiveChanges();
    }

    handleResponsiveChanges() {
        // Automatische Anpassungen basierend auf Gerätetyp
        if (this.isMobile) {
            this.setupMobileLayout();
        } else {
            this.setupDesktopLayout();
        }
    }

    setupMobileLayout() {
        // Mobile-spezifische Setup
        console.log('Setting up mobile layout');
    }

    setupDesktopLayout() {
        // Desktop-spezifische Setup
        console.log('Setting up desktop layout');
    }

    checkLogin() {
        const savedAdmin = sessionStorage.getItem('nordstadt_admin');
        if (savedAdmin) {
            this.currentAdmin = savedAdmin;
            this.showApp();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginModal').classList.add('active');
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('loginModal').classList.remove('active');
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('currentAdmin').textContent = this.currentAdmin;
        document.getElementById('sidebarAdmin').textContent = this.currentAdmin;
        document.getElementById('adminName').value = this.currentAdmin;
        this.loadTheme();
    }

    setupEventListeners() {
        // Login Form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout Buttons
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        document.getElementById('sidebarLogout').addEventListener('click', () => {
            this.handleLogout();
        });

        // Theme Toggles
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('mobileThemeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Mobile Menu
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('sidebarClose').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('sidebarOverlay').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Sidebar Actions
        document.querySelectorAll('.sidebar-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.selectedPlayer) {
                    this.showNotification('Bitte wähle zuerst einen Spieler aus!', 'warning');
                    return;
                }
                const action = e.currentTarget.dataset.action;
                this.showActionForm(action);
                this.toggleSidebar(); // Schließe Sidebar nach Aktion
            });
        });

        // Desktop Action Buttons
        document.querySelectorAll('.action-card').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.selectedPlayer) {
                    this.showNotification('Bitte wähle zuerst einen Spieler aus!', 'warning');
                    return;
                }
                const action = e.currentTarget.dataset.action;
                this.showActionForm(action);
            });
        });

        // Form submission
        document.getElementById('adminForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAction();
        });

        // Cancel action
        document.getElementById('cancelAction').addEventListener('click', () => {
            this.hideActionForm();
        });

        // Clear player selection
        document.getElementById('clearSelection').addEventListener('click', () => {
            this.clearPlayerSelection();
        });

        // Filter records
        document.getElementById('filterType').addEventListener('change', () => {
            this.filterRecords();
        });

        // Modal events
        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.hideDeleteModal();
        });

        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Search inputs (Desktop und Mobile)
        const setupSearch = (inputId, resultsId) => {
            const input = document.getElementById(inputId);
            const results = document.getElementById(resultsId);
            
            if (input && results) {
                input.addEventListener('input', (e) => {
                    this.handleSearchInput(e.target.value, results);
                });

                input.addEventListener('focus', () => {
                    if (input.value.length > 0 && results.innerHTML) {
                        results.style.display = 'block';
                    }
                });
            }
        };

        setupSearch('playerSearch', 'searchResults');
        setupSearch('sidebarPlayerSearch', 'sidebarSearchResults');
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Verhindere Scrollen wenn Sidebar offen ist
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
    }

    handleSearchInput(query, resultsContainer) {
        clearTimeout(this.debounceTimer);
        
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }

        if (query.length >= 2) {
            this.showSearchLoading(resultsContainer);
        }

        this.debounceTimer = setTimeout(() => {
            this.performSearch(query, resultsContainer);
        }, 300);
    }

    showSearchLoading(container) {
        container.innerHTML = `
            <div class="search-result-item loading-item">
                <div class="loading-spinner"></div>
                <span>Suche bei Roblox...</span>
            </div>
        `;
        container.style.display = 'block';
    }

    async performSearch(query, resultsContainer) {
        try {
            const response = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}`);
            
            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }
            
            const results = await response.json();
            this.displaySearchResults(results, resultsContainer);
        } catch (error) {
            console.error('Search error:', error);
            this.showSearchError('Suche fehlgeschlagen. Bitte versuche es erneut.', resultsContainer);
        }
    }

    displaySearchResults(players, container) {
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
                container.style.display = 'none';
                // Clear search input
                document.getElementById('playerSearch').value = '';
                document.getElementById('sidebarPlayerSearch').value = '';
            });

            container.appendChild(item);
        });

        container.style.display = 'block';
    }

    showSearchError(message, container) {
        container.innerHTML = `
            <div class="search-result-item error-item">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
        `;
        container.style.display = 'block';
    }

    handleLogin() {
        const adminName = document.getElementById('adminLogin').value.trim();
        if (adminName) {
            this.currentAdmin = adminName;
            sessionStorage.setItem('nordstadt_admin', adminName);
            this.showApp();
            this.showNotification(`Willkommen, ${adminName}!`, 'success');
        }
    }

    handleLogout() {
        sessionStorage.removeItem('nordstadt_admin');
        this.currentAdmin = null;
        this.showLogin();
        this.showNotification('Erfolgreich ausgeloggt', 'info');
        this.toggleSidebar(); // Schließe Sidebar falls offen
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode', !isDark);
        
        // Update beide Theme Buttons
        const icons = document.querySelectorAll('#themeToggle i, #mobileThemeToggle i');
        icons.forEach(icon => {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
        
        localStorage.setItem('nordstadt_theme', isDark ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('nordstadt_theme') || 'light';
        const isDark = savedTheme === 'dark';
        
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        
        const icons = document.querySelectorAll('#themeToggle i, #mobileThemeToggle i');
        icons.forEach(icon => {
            icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        });
    }

    showActionForm(action) {
        const form = document.getElementById('actionForm');
        const formTitle = document.getElementById('formTitle');
        
        const actionTitles = {
            'verbal_warn': 'Mündliche Verwarnung',
            'warn': 'Schriftliche Verwarnung', 
            'kick': 'Spieler Kicken',
            '1day_ban': '1-Tages Ban',
            'permanent_ban': 'Permanenter Ban'
        };

        formTitle.textContent = `${actionTitles[action]} für ${this.selectedPlayer.name}`;
        document.getElementById('actionType').value = action;
        document.getElementById('adminName').value = this.currentAdmin;
        
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideActionForm() {
        document.getElementById('actionForm').classList.add('hidden');
        document.getElementById('adminForm').reset();
    }

    async submitAction() {
        const formData = {
            type: document.getElementById('actionType').value,
            playerId: this.selectedPlayer.id,
            playerName: this.selectedPlayer.name,
            reason: document.getElementById('reason').value,
            adminName: this.currentAdmin,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.apiBase}/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showNotification('Aktion erfolgreich durchgeführt!', 'success');
                this.hideActionForm();
                await this.loadAllRecords();
                await this.loadPlayerHistory();
            }
        } catch (error) {
            this.showNotification('Fehler bei der Aktion!', 'error');
            console.error('Error:', error);
        }
    }

    async loadAllRecords() {
        try {
            const response = await fetch(`${this.apiBase}/admin`);
            this.allRecords = await response.json();
            this.displayRecords(this.allRecords);
        } catch (error) {
            console.error('Error loading records:', error);
            this.allRecords = [];
        }
    }

    displayRecords(records) {
        const container = document.getElementById('recordsList');
        const filteredRecords = this.filterRecordsByType(records);
        
        container.innerHTML = filteredRecords.map(record => this.createRecordHTML(record)).join('');
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.currentTarget.dataset.id;
                this.showDeleteModal(recordId);
            });
        });
    }

    createRecordHTML(record) {
        const typeLabels = {
            'verbal_warn': 'Mündliche Verwarnung',
            'warn': 'Schriftliche Verwarnung',
            'kick': 'Kick',
            '1day_ban': '1-Tage Ban',
            'permanent_ban': 'Permanenter Ban'
        };

        const typeColors = {
            'verbal_warn': 'verbal_warn',
            'warn': 'warn',
            'kick': 'kick',
            '1day_ban': 'ban',
            'permanent_ban': 'ban'
        };

        return `
            <div class="record-item">
                <div class="record-info">
                    <div class="record-header">
                        <span class="record-player">${record.playerName}</span>
                        <span class="record-type ${typeColors[record.type]}">${typeLabels[record.type]}</span>
                    </div>
                    <div class="record-reason">${record.reason}</div>
                    <div class="record-meta">
                        <span>Admin: ${record.adminName}</span>
                        <span>Datum: ${new Date(record.timestamp).toLocaleString('de-DE')}</span>
                        ${record.playerId ? `<span>ID: ${record.playerId}</span>` : ''}
                    </div>
                </div>
                <div class="record-actions">
                    <button class="delete-btn" data-id="${record.id}">
                        <i class="fas fa-trash"></i> 
                        <span class="btn-text">Löschen</span>
                    </button>
                </div>
            </div>
        `;
    }

    filterRecordsByType(records) {
        const filterType = document.getElementById('filterType').value;
        if (filterType === 'all') return records;
        return records.filter(record => record.type === filterType);
    }

    filterRecords() {
        this.displayRecords(this.allRecords);
    }

    showDeleteModal(recordId) {
        this.pendingDeleteId = recordId;
        document.getElementById('deleteModal').classList.add('active');
    }

    hideDeleteModal() {
        this.pendingDeleteId = null;
        document.getElementById('deleteModal').classList.remove('active');
    }

    async confirmDelete() {
        if (!this.pendingDeleteId) return;

        try {
            const response = await fetch(`${this.apiBase}/admin`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: this.pendingDeleteId })
            });

            if (response.ok) {
                this.showNotification('Eintrag erfolgreich gelöscht!', 'success');
                await this.loadAllRecords();
                if (this.selectedPlayer) {
                    await this.loadPlayerHistory();
                }
            }
        } catch (error) {
            this.showNotification('Fehler beim Löschen!', 'error');
            console.error('Error:', error);
        }

        this.hideDeleteModal();
    }

    selectPlayer(player) {
        this.selectedPlayer = player;
        this.showSelectedPlayer();
        this.loadPlayerHistory();
        
        // Auf Mobile: Schließe Sidebar nach Spielerauswahl
        if (this.isMobile) {
            this.toggleSidebar();
        }
    }

    showSelectedPlayer() {
        const container = document.getElementById('selectedPlayer');
        const playerName = document.getElementById('playerName');
        const playerId = document.getElementById('playerId');
        const playerDisplayName = document.getElementById('playerDisplayName');
        const playerAvatar = document.getElementById('playerAvatar');

        playerName.textContent = this.selectedPlayer.name;
        playerId.textContent = `ID: ${this.selectedPlayer.id}`;
        playerDisplayName.textContent = this.selectedPlayer.displayName ? `(${this.selectedPlayer.displayName})` : '';
        playerAvatar.src = this.selectedPlayer.avatar || '/api/placeholder-avatar';
        playerAvatar.alt = `${this.selectedPlayer.name} Avatar`;

        container.classList.remove('hidden');
        document.getElementById('playerHistory').classList.remove('hidden');
    }

    clearPlayerSelection() {
        this.selectedPlayer = null;
        document.getElementById('selectedPlayer').classList.add('hidden');
        document.getElementById('playerHistory').classList.add('hidden');
    }

    async loadPlayerHistory() {
        if (!this.selectedPlayer) return;

        try {
            const response = await fetch(`${this.apiBase}/admin`);
            const allRecords = await response.json();
            const playerRecords = allRecords.filter(record => 
                record.playerId === this.selectedPlayer.id
            );

            this.displayPlayerHistory(playerRecords);
        } catch (error) {
            console.error('Error loading player history:', error);
        }
    }

    displayPlayerHistory(records) {
        const container = document.getElementById('historyList');
        
        if (records.length === 0) {
            container.innerHTML = '<div class="no-results">Keine Einträge für diesen Spieler.</div>';
            return;
        }

        container.innerHTML = records.map(record => this.createRecordHTML(record)).join('');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const colors = {
            success: 'success',
            error: 'error', 
            warning: 'warning',
            info: 'info'
        };

        notification.className = `notification ${colors[type]}`;
        notification.innerHTML = `
            <i class="${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Automatisch entfernen nach 5 Sekunden
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, könnte optimiert werden
        console.log('Page is hidden');
    } else {
        // Page is visible
        console.log('Page is visible');
    }
});