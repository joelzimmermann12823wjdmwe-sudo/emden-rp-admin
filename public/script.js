class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.selectedPlayer = null;
        this.pendingDeleteId = null;
        this.currentAdmin = null;
        this.init();
    }

    async init() {
        this.checkLogin();
        this.setupEventListeners();
        await this.loadAllRecords();
    }

    checkLogin() {
        // Prüfe ob bereits eingeloggt
        const savedAdmin = sessionStorage.getItem('emden_admin');
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
        document.getElementById('adminName').value = this.currentAdmin;
        
        // Lade gespeichertes Theme
        this.loadTheme();
    }

    setupEventListeners() {
        // Login Form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout Button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Action buttons
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
    }

    handleLogin() {
        const adminName = document.getElementById('adminLogin').value.trim();
        if (adminName) {
            this.currentAdmin = adminName;
            sessionStorage.setItem('emden_admin', adminName);
            this.showApp();
            this.showNotification(`Willkommen, ${adminName}!`, 'success');
        }
    }

    handleLogout() {
        sessionStorage.removeItem('emden_admin');
        this.currentAdmin = null;
        this.showLogin();
        this.showNotification('Erfolgreich ausgeloggt', 'info');
    }

    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode', !isDark);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        
        // Speichere Theme Preference
        localStorage.setItem('emden_theme', isDark ? 'dark' : 'light');
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('emden_theme') || 'light';
        const isDark = savedTheme === 'dark';
        
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        
        const icon = document.querySelector('#themeToggle i');
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }

    // ... (rest of the methods remain the same as previous version)
    showActionForm(action) {
        const form = document.getElementById('actionForm');
        const formTitle = document.getElementById('formTitle');
        
        const actionTitles = {
            'verbal_warn': 'Mündliche Verwarnung',
            'warn': 'Schriftliche Verwarnung', 
            'kick': 'Spieler Kicken',
            '1day_ban': '1-Tages Ban',
            '7day_ban': '7-Tage Ban',
            'permanent_ban': 'Permanenter Ban'
        };

        formTitle.textContent = `${actionTitles[action]} für ${this.selectedPlayer.name}`;
        document.getElementById('actionType').value = action;
        document.getElementById('adminName').value = this.currentAdmin;
        
        form.classList.remove('hidden');
        form.scrollIntoView({ behavior: 'smooth' });
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
        
        // Add delete event listeners
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
            '7day_ban': '7-Tage Ban',
            'permanent_ban': 'Permanenter Ban'
        };

        const typeColors = {
            'verbal_warn': 'verbal_warn',
            'warn': 'warn',
            'kick': 'kick',
            '1day_ban': 'ban',
            '7day_ban': 'ban',
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
                        <i class="fas fa-trash"></i> Löschen
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
        // Einfache Notification - kann durch ein schöneres System ersetzt werden
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        // Für eine schönere Lösung könnte man ein Toast-System implementieren
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${icons[type]} ${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});