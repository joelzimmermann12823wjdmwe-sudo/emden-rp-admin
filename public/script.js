console.log('🚀 Script.js wird geladen...');

class AdminPanel {
    constructor() {
        console.log('🔧 AdminPanel wird erstellt...');
        this.apiBase = '/api';
        this.selectedPlayer = null;
        this.pendingDeleteId = null;
        this.currentAdmin = null;
        this.init();
    }

    init() {
        console.log('🔧 Initialisiere AdminPanel...');
        this.checkLogin();
        this.setupEventListeners();
        this.loadAllRecords();
    }

    checkLogin() {
        console.log('🔍 Prüfe Login...');
        const savedAdmin = sessionStorage.getItem('nordstadt_admin');
        console.log('Gespeicherter Admin:', savedAdmin);
        
        if (savedAdmin) {
            this.currentAdmin = savedAdmin;
            this.showApp();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        console.log('👤 Zeige Login...');
        const loginModal = document.getElementById('loginModal');
        const app = document.getElementById('app');
        
        if (loginModal) {
            loginModal.classList.add('active');
            console.log('✅ Login Modal aktiviert');
        }
        if (app) {
            app.classList.add('hidden');
            console.log('✅ App versteckt');
        }
    }

    showApp() {
        console.log('🎯 Zeige App...');
        const loginModal = document.getElementById('loginModal');
        const app = document.getElementById('app');
        
        if (loginModal) {
            loginModal.classList.remove('active');
            console.log('✅ Login Modal versteckt');
        }
        if (app) {
            app.classList.remove('hidden');
            console.log('✅ App angezeigt');
        }
        
        this.updateAdminInfo();
        this.loadTheme();
    }

    updateAdminInfo() {
        console.log('👤 Update Admin Info:', this.currentAdmin);
        const currentAdminElement = document.getElementById('currentAdmin');
        const sidebarAdminElement = document.getElementById('sidebarAdmin');
        const adminNameElement = document.getElementById('adminName');
        
        if (currentAdminElement) {
            currentAdminElement.textContent = this.currentAdmin;
            console.log('✅ Admin Name aktualisiert');
        }
        if (sidebarAdminElement) sidebarAdminElement.textContent = this.currentAdmin;
        if (adminNameElement) adminNameElement.value = this.currentAdmin;
    }

    setupEventListeners() {
        console.log('🔧 Setup Event Listeners...');
        
        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('📝 Login Form submitted');
                this.handleLogin();
            });
            console.log('✅ Login Form Event Listener hinzugefügt');
        } else {
            console.log('❌ Login Form nicht gefunden!');
        }

        // Logout Buttons
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        const sidebarLogout = document.getElementById('sidebarLogout');
        if (sidebarLogout) {
            sidebarLogout.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Theme Toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        const mobileThemeToggle = document.getElementById('mobileThemeToggle');
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Mobile Menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        const sidebarClose = document.getElementById('sidebarClose');
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        console.log('✅ Alle Event Listener hinzugefügt');
    }

    handleLogin() {
        console.log('🔐 Handle Login...');
        const adminLogin = document.getElementById('adminLogin');
        
        if (!adminLogin) {
            console.log('❌ Admin Login Input nicht gefunden!');
            return;
        }
        
        const adminName = adminLogin.value.trim();
        console.log('Eingegebener Name:', adminName);
        
        if (adminName) {
            this.currentAdmin = adminName;
            sessionStorage.setItem('nordstadt_admin', adminName);
            console.log('✅ Admin gespeichert:', adminName);
            this.showApp();
            this.showNotification(`Willkommen, ${adminName}!`, 'success');
        } else {
            console.log('❌ Kein Name eingegeben');
            this.showNotification('Bitte gib einen Namen ein!', 'error');
        }
    }

    handleLogout() {
        console.log('🚪 Logout...');
        sessionStorage.removeItem('nordstadt_admin');
        this.currentAdmin = null;
        this.showLogin();
        this.showNotification('Erfolgreich ausgeloggt', 'info');
    }

    toggleTheme() {
        console.log('🎨 Theme wechseln...');
        const isDark = document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode', !isDark);
        
        const icons = document.querySelectorAll('#themeToggle i, #mobileThemeToggle i');
        icons.forEach(icon => {
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
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
            if (icon) {
                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar) sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
        
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
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
        if (!container) return;
        
        container.innerHTML = records.map(record => this.createRecordHTML(record)).join('');
    }

    createRecordHTML(record) {
        const typeLabels = {
            'verbal_warn': 'Mündliche Verwarnung',
            'warn': 'Schriftliche Verwarnung',
            'kick': 'Kick',
            '1day_ban': '1-Tage Ban',
            'permanent_ban': 'Permanenter Ban'
        };

        return `
            <div class="record-item">
                <div class="record-info">
                    <div class="record-header">
                        <span class="record-player">${record.playerName}</span>
                        <span class="record-type">${typeLabels[record.type] || record.type}</span>
                    </div>
                    <div class="record-reason">${record.reason}</div>
                    <div class="record-meta">
                        <span>Admin: ${record.adminName}</span>
                        <span>Datum: ${new Date(record.timestamp).toLocaleString('de-DE')}</span>
                    </div>
                </div>
            </div>
        `;
    }

    selectPlayer(player) {
        console.log('🎮 Spieler ausgewählt:', player);
        this.selectedPlayer = player;
        this.showSelectedPlayer();
        this.showNotification(`Spieler ${player.name} ausgewählt`, 'success');
    }

    showSelectedPlayer() {
        const container = document.getElementById('selectedPlayer');
        const playerName = document.getElementById('playerName');
        const playerId = document.getElementById('playerId');
        const playerAvatar = document.getElementById('playerAvatar');

        if (playerName) playerName.textContent = this.selectedPlayer.name;
        if (playerId) playerId.textContent = `ID: ${this.selectedPlayer.id}`;
        if (playerAvatar) {
            playerAvatar.src = this.selectedPlayer.avatar || '/api/placeholder-avatar';
        }

        if (container) container.classList.remove('hidden');
    }

    showNotification(message, type = 'info') {
        // Einfache Alert als Fallback
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        alert(`${icons[type]} ${message}`);
    }
}

// Initialize
console.log('🚀 Starte AdminPanel...');
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM ist geladen, erstelle AdminPanel...');
    window.adminPanel = new AdminPanel();
    console.log('✅ AdminPanel erstellt:', window.adminPanel);
});