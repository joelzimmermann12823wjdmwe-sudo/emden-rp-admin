class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.showTab('bans');
    }

    setupEventListeners() {
        // Tab Navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.showTab(tab);
            });
        });

        // Form Submission
        document.getElementById('actionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAction();
        });
    }

    showTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Show active tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === tabName);
        });

        // Refresh the displayed data
        this.refreshDisplay(tabName);
    }

    async submitAction() {
        const formData = {
            type: document.getElementById('actionType').value,
            playerName: document.getElementById('playerName').value,
            playerId: document.getElementById('playerId').value,
            reason: document.getElementById('reason').value,
            adminName: document.getElementById('adminName').value
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
                await this.loadData();
                this.showTab(formData.type + 's');
                document.getElementById('actionForm').reset();
                this.showNotification('Aktion erfolgreich durchgeführt!', 'success');
            }
        } catch (error) {
            this.showNotification('Fehler bei der Aktion!', 'error');
            console.error('Error:', error);
        }
    }

    async loadData() {
        try {
            const response = await fetch(`${this.apiBase}/admin`);
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
            this.data = { bans: [], kicks: [], warns: [] };
        }
    }

    refreshDisplay(type) {
        const container = document.getElementById(`${type}List`);
        const items = this.data[type] || [];
        
        container.innerHTML = items.map(item => `
            <div class="action-item ${item.type}">
                <div class="action-header">
                    <span class="player-name">${item.playerName}</span>
                    <span class="action-type">${item.type.toUpperCase()}</span>
                </div>
                <div class="reason">Grund: ${item.reason}</div>
                <div class="meta">
                    <span>Admin: ${item.adminName}</span>
                    <span>Datum: ${new Date(item.timestamp).toLocaleString('de-DE')}</span>
                </div>
                ${item.playerId ? `<div class="meta">Spieler ID: ${item.playerId}</div>` : ''}
            </div>
        `).join('');
    }

    showNotification(message, type) {
        // Einfache Notification Implementierung
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }
}

// Initialize the admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});