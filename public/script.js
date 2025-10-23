// public/script.js - FINALE VERSION

class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.selectedPlayer = null;
        this.currentAdmin = null;
        this.allRecords = [];
        this.init();
    }
    
    // --- HELPER ---
    debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // --- INITIALISIERUNG & SETUP ---
    init() {
        this.checkLogin();
        this.setupEventListeners();
        this.loadAllRecords(); // Lädt alle Records beim Start
    }

    setupEventListeners() {
        // --- Login / Logout ---
        document.getElementById('loginForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.handleLogin(); });
        document.querySelectorAll('#logoutBtn, #sidebarLogout').forEach(btn => btn.addEventListener('click', () => this.handleLogout()));

        // --- Suche (Desktop & Mobile) ---
        const searchInput = document.getElementById('playerSearch');
        const sidebarSearchInput = document.getElementById('sidebarPlayerSearch');

        // WICHTIG: Korrekte Verwendung des Debounce-Helferchens
        if (searchInput) searchInput.addEventListener('input', this.debounce((e) => this.handlePlayerSearch(e.target.value, document.getElementById('searchResults')), 300));
        if (sidebarSearchInput) sidebarSearchInput.addEventListener('input', this.debounce((e) => this.handlePlayerSearch(e.target.value, document.getElementById('sidebarSearchResults')), 300));
        
        // --- Suchergebnis-Klick (Delegate auf beide Container) ---
        document.querySelectorAll('#searchResults, #sidebarSearchResults').forEach(container => {
            container.addEventListener('click', (e) => {
                const item = e.target.closest('.search-result-item');
                if (item && item.dataset.id && item.dataset.name) {
                    this.selectPlayer({ 
                        id: item.dataset.id, 
                        name: item.dataset.name 
                    });
                }
            });
        });

        // --- Klick außerhalb, um Ergebnisse zu verstecken ---
        document.addEventListener('click', (e) => {
            // ... (logik um Suchergebnisse zu verstecken)
            if (searchInput && !searchInput.contains(e.target) && !document.getElementById('searchResults')?.contains(e.target)) {
                this.hideResults(document.getElementById('searchResults'));
            }
            if (sidebarSearchInput && !sidebarSearchInput.contains(e.target) && !document.getElementById('sidebarSearchResults')?.contains(e.target)) {
                this.hideResults(document.getElementById('sidebarSearchResults'));
            }
        });
        
        // --- Aktionen, Formular, Sidebar (Restliche Event-Listener) ---
        document.querySelectorAll('.action-card, .sidebar-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.selectedPlayer) { alert('Bitte wähle zuerst einen Spieler aus!'); return; }
                const action = e.currentTarget.dataset.action;
                this.showActionForm(action);
                if (e.currentTarget.classList.contains('sidebar-action')) { this.toggleSidebar(); }
            });
        });

        document.getElementById('adminForm')?.addEventListener('submit', (e) => { e.preventDefault(); this.submitAction(); });
        document.getElementById('cancelAction')?.addEventListener('click', () => this.hideActionForm());
        document.getElementById('clearSelection')?.addEventListener('click', () => this.clearPlayerSelection());
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarClose')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarOverlay')?.addEventListener('click', () => this.toggleSidebar());
        document.getElementById('showAllRecords')?.addEventListener('click', () => this.loadAllRecords(true));

        // --- Theme Toggle ---
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.handleThemeToggle());
        this.applyTheme();
    }

    // ... (Theme Logik) ...
    applyTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        document.body.classList.toggle('dark-mode', currentTheme === 'dark');
        document.getElementById('theme-toggle').innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    handleThemeToggle() {
        const isDark = document.body.classList.toggle('dark-mode');
        const newTheme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        document.getElementById('theme-toggle').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // ... (Login / UI States Logik) ...
    checkLogin() {
        const savedAdmin = sessionStorage.getItem('nordstadt_admin');
        if (savedAdmin) { this.currentAdmin = savedAdmin; this.showApp(); } else { this.showLogin(); }
    }
    showLogin() {
        document.getElementById('loginModal')?.classList.add('active');
        document.getElementById('app')?.classList.add('hidden');
    }
    showApp() {
        document.getElementById('loginModal')?.classList.remove('active');
        document.getElementById('app')?.classList.remove('hidden');
        this.updateAdminInfo();
    }
    updateAdminInfo() {
        document.getElementById('adminName').value = this.currentAdmin;
        document.getElementById('currentAdmin').textContent = this.currentAdmin;
        document.getElementById('sidebarAdmin').textContent = this.currentAdmin;
    }
    handleLogin() {
        const adminName = document.getElementById('adminLogin').value.trim();
        if (adminName) {
            this.currentAdmin = adminName;
            sessionStorage.setItem('nordstadt_admin', adminName);
            this.showApp();
        }
    }
    handleLogout() {
        sessionStorage.removeItem('nordstadt_admin');
        this.currentAdmin = null;
        this.showLogin();
        this.clearPlayerSelection();
    }
    toggleSidebar() {
        document.getElementById('sidebar')?.classList.toggle('active');
        document.getElementById('sidebarOverlay')?.classList.toggle('active');
        document.body.style.overflow = document.getElementById('sidebar')?.classList.contains('active') ? 'hidden' : '';
    }

    showActionForm(action) {
        const form = document.getElementById('actionForm');
        const formTitle = document.getElementById('formTitle');
        if (!form || !formTitle) return;
        
        const actionTitles = {
            'verbal_warn': 'Mündliche Verwarnung', 'warn': 'Schriftliche Verwarnung', 'kick': 'Spieler Kicken',
            '1day_ban': '1-Tages Ban', 'permanent_ban': 'Permanenter Ban'
        };
        const backendTypes = {
            'verbal_warn': 'Mündlicher Warn', 'warn': 'Warn', 'kick': 'Kick',
            '1day_ban': 'Tagesban', 'permanent_ban': 'Ban'
        };

        formTitle.textContent = `${actionTitles[action]} für ${this.selectedPlayer.name}`;
        document.getElementById('actionType').value = backendTypes[action]; 
        form.classList.add('active'); 
    }
    hideActionForm() {
        document.getElementById('actionForm')?.classList.remove('active');
        document.getElementById('adminForm')?.reset();
    }

    // --- SPIELER SUCHE LOGIK (Verwendet den korrekten API-Pfad) ---
    async handlePlayerSearch(query, resultsContainer) {
        if (query.length < 3) {
            this.hideResults(resultsContainer);
            return;
        }

        try {
            // HIER IST DER WICHTIGE PFAD: /api/search-roblox
            const response = await fetch(`${this.apiBase}/search-roblox?query=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');
            
            const results = await response.json();
            this.displaySearchResults(results, resultsContainer);
        } catch (error) {
            this.showError('Suche fehlgeschlagen / Server offline (Prüfe API-Datei)', resultsContainer);
        }
    }

    displaySearchResults(players, container) {
        if (!container) return;
        
        container.innerHTML = players.map(player => 
            // Hier wird die Liste der auswählbaren Spieler generiert
            `<div class="search-result-item" data-id="${player.id}" data-name="${player.name}">
                <img src="/api/placeholder-avatar" alt="${player.name}">
                <div class="search-result-info">
                    <div class="player-name-row"><h4>${player.name}</h4></div>
                    <div class="player-details"><span class="player-id">ID: ${player.id}</span></div>
                </div>
            </div>`
        ).join('');
        
        if (players.length === 0) {
            container.innerHTML = '<div class="search-result-item no-results">Keine Spieler gefunden</div>';
        }
        
        container.classList.add('active'); 
    }

    showError(message, container) {
        if (!container) return;
        container.innerHTML = `<div class="search-result-item error-message">${message}</div>`;
        container.classList.add('active');
    }
    
    hideResults(container) {
        if (container) container.classList.remove('active');
    }

    // --- SPIELERAUSWAHL & HISTORIE ---
    selectPlayer(player) {
        this.selectedPlayer = player;
        this.showSelectedPlayer();
        this.hideActionForm();
        this.hideResults(document.getElementById('searchResults'));
        this.hideResults(document.getElementById('sidebarSearchResults'));

        document.getElementById('playerSearch').value = player.name; 
        document.getElementById('sidebarPlayerSearch').value = player.name; 
        
        this.loadPlayerRecords(player.id, player.name); // NUR Historie des Spielers laden
    }

    clearPlayerSelection() {
        this.selectedPlayer = null;
        this.loadAllRecords(true); 
        
        document.getElementById('selectedPlayerContainer')?.classList.add('hidden');
        document.getElementById('playerSearch').value = '';
        document.getElementById('sidebarPlayerSearch').value = '';
        this.hideActionForm();
    }

    showSelectedPlayer() {
        const container = document.getElementById('selectedPlayerContainer');
        if (container) container.classList.remove('hidden');

        document.getElementById('playerNameDisplay').textContent = this.selectedPlayer.name;
        document.getElementById('playerIdDisplay').textContent = `ID: ${this.selectedPlayer.id}`;
        document.getElementById('playerAvatar').src = '/api/placeholder-avatar';
        document.getElementById('historyTitle').textContent = `Historie für ${this.selectedPlayer.name}`;
    }

    // --- DATENVERWALTUNG (Verwendet den korrekten API-Pfad) ---
    async submitAction() {
        // ... (Logik zum Sammeln der Formulardaten) ...
        const actionType = document.getElementById('actionType');
        const reason = document.getElementById('reason');
        if (!actionType || !reason || !this.selectedPlayer) return;

        const formData = {
            type: actionType.value, playerId: this.selectedPlayer.id, playerName: this.selectedPlayer.name,
            reason: reason.value, adminName: this.currentAdmin, timestamp: new Date().toISOString()
        };

        try {
            // HIER IST DER WICHTIGE PFAD: /api/admin
            const response = await fetch(`${this.apiBase}/admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Aktion erfolgreich durchgeführt!');
                this.hideActionForm();
                await this.loadPlayerRecords(this.selectedPlayer.id, this.selectedPlayer.name);
            } else {
                alert('Fehler bei der Aktion!');
            }
        } catch (error) {
            alert('Interner Serverfehler beim Speichern.');
        }
    }

    async loadAllRecords(forceReload = false) {
        document.getElementById('historyTitle').textContent = 'Gesamte Eintrags-Historie';
        try {
            // HIER IST DER WICHTIGE PFAD: /api/admin
            const response = await fetch(`${this.apiBase}/admin`);
            this.allRecords = await response.json();
            this.displayRecords(this.allRecords);
        } catch (error) {
            this.allRecords = [];
            this.displayError('Fehler beim Laden der Gesamthistorie. (Prüfe admin.js)', document.getElementById('recordsList'));
        }
    }

    async loadPlayerRecords(playerId, playerName) {
        document.getElementById('historyTitle').textContent = `Historie für ${playerName}`;
        try {
            // HIER IST DER WICHTIGE PFAD: /api/admin?playerId=...
            const response = await fetch(`${this.apiBase}/admin?playerId=${playerId}`);
            const filteredRecords = await response.json();
            this.displayRecords(filteredRecords);
        } catch (error) {
            this.displayError('Fehler beim Laden der Spielerhistorie. (Prüfe admin.js)', document.getElementById('recordsList'));
        }
    }

    displayRecords(records) {
        // ... (Logik zur Darstellung der Einträge) ...
        const container = document.getElementById('recordsList');
        if (!container) return;
        
        if (records.length === 0) {
            container.innerHTML = '<div class="no-records">Keine Einträge vorhanden.</div>';
            return;
        }

        container.innerHTML = records.map(record => this.createRecordHTML(record)).join('');

        // Listener für Lösch-Buttons
        document.querySelectorAll('.delete-record-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleDeleteRecord(e.currentTarget.dataset.id));
        });
    }

    createRecordHTML(record) {
        const typeLabels = {
            'Mündlicher Warn': 'Mündlich', 'Warn': 'Schriftlich', 'Kick': 'Kick',
            'Tagesban': '1-Tag Ban', 'Ban': 'Permanent Ban'
        };
        const recordType = typeLabels[record.type] || record.type;
        const timestamp = new Date(record.timestamp).toLocaleString('de-DE');
        const typeClass = record.type.toLowerCase().replace(/ /g, '-');

        return `
            <div class="record-item" data-id="${record.id}">
                <div class="record-header">
                    <span class="record-type type-${typeClass}" title="${record.type}">${recordType}</span>
                    <span class="record-date">${timestamp}</span>
                </div>
                <div class="record-reason">${record.reason}</div>
                <div class="record-meta">
                    <span>Admin: ${record.adminName}</span>
                    <button class="delete-record-btn" data-id="${record.id}">Löschen</button>
                </div>
            </div>
        `;
    }

    async handleDeleteRecord(id) {
        if (!confirm('Sicher, dass dieser Eintrag permanent gelöscht werden soll?')) return;

        try {
            // HIER IST DER WICHTIGE PFAD: /api/admin
            const response = await fetch(`${this.apiBase}/admin`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (response.ok) {
                alert('Eintrag erfolgreich gelöscht!');
                if (this.selectedPlayer) {
                    this.loadPlayerRecords(this.selectedPlayer.id, this.selectedPlayer.name);
                } else {
                    this.loadAllRecords();
                }
            } else {
                const error = await response.json();
                alert(`Fehler beim Löschen: ${error.error || 'Unbekannter Fehler'}`);
            }
        } catch (error) {
            alert('Interner Serverfehler beim Löschen.');
        }
    }
    
    displayError(message, container) {
        if (container) container.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Initialisiere das Panel, sobald das DOM geladen ist
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});