class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.selectedPlayer = null;
        this.pendingDeleteId = null;
        this.currentAdmin = null;
        this.isMobile = false;
        this.isTablet = false;
        this.isDesktop = false;
        this.activityLogs = []; // Neue Variable für Aktivitäts-Logs
        this.init();
    }

    // ... bestehende Methoden ...

    // NEUE METHODE: Log Aktivität
    logActivity(action, details = {}) {
        const logEntry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            admin: this.currentAdmin,
            action: action,
            details: details,
            ip: 'N/A' // Könnte später mit Backend erweitert werden
        };

        this.activityLogs.unshift(logEntry); // Neueste zuerst
        
        // In localStorage speichern für Persistenz
        this.saveLogsToStorage();
        
        // Log in Konsole für Debugging
        console.log('📝 Activity Log:', logEntry);
        
        return logEntry;
    }

    // NEUE METHODE: ID Generator
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // NEUE METHODE: Logs speichern
    saveLogsToStorage() {
        try {
            // Begrenze auf die letzten 1000 Einträge
            const limitedLogs = this.activityLogs.slice(0, 1000);
            localStorage.setItem('nordstadt_admin_logs', JSON.stringify(limitedLogs));
        } catch (error) {
            console.error('Error saving logs to storage:', error);
        }
    }

    // NEUE METHODE: Logs laden
    loadLogsFromStorage() {
        try {
            const savedLogs = localStorage.getItem('nordstadt_admin_logs');
            if (savedLogs) {
                this.activityLogs = JSON.parse(savedLogs);
            }
        } catch (error) {
            console.error('Error loading logs from storage:', error);
            this.activityLogs = [];
        }
    }

    // NEUE METHODE: Logs anzeigen
    showActivityLogs() {
        const modal = document.getElementById('activityLogModal');
        const logList = document.getElementById('activityLogList');
        
        if (!modal || !logList) return;
        
        // Lade Logs falls noch nicht geladen
        if (this.activityLogs.length === 0) {
            this.loadLogsFromStorage();
        }
        
        logList.innerHTML = this.activityLogs.map(log => this.createLogEntryHTML(log)).join('') || 
                           '<div class="no-logs">Keine Aktivitäts-Logs vorhanden</div>';
        
        modal.classList.add('active');
    }

    // NEUE METHODE: Log Eintrag HTML erstellen
    createLogEntryHTML(log) {
        const actionIcons = {
            'login': 'fas fa-sign-in-alt',
            'logout': 'fas fa-sign-out-alt',
            'player_select': 'fas fa-user-check',
            'ban': 'fas fa-ban',
            'kick': 'fas fa-door-open',
            'warn': 'fas fa-exclamation-triangle',
            'verbal_warn': 'fas fa-comment',
            'delete_record': 'fas fa-trash',
            'view_logs': 'fas fa-history'
        };

        const actionColors = {
            'login': 'success',
            'logout': 'info',
            'player_select': 'primary',
            'ban': 'danger',
            'kick': 'warning',
            'warn': 'warning',
            'verbal_warn': 'info',
            'delete_record': 'danger',
            'view_logs': 'secondary'
        };

        const actionTexts = {
            'login': 'Hat sich angemeldet',
            'logout': 'Hat sich abgemeldet',
            'player_select': 'Hat Spieler ausgewählt',
            'ban': 'Hat Spieler gebannt',
            'kick': 'Hat Spieler gekickt',
            'warn': 'Hat Verwarnung erteilt',
            'verbal_warn': 'Hat mündliche Verwarnung erteilt',
            'delete_record': 'Hat Eintrag gelöscht',
            'view_logs': 'Hat Aktivitäts-Logs eingesehen'
        };

        return `
            <div class="log-entry log-${actionColors[log.action] || 'secondary'}">
                <div class="log-icon">
                    <i class="${actionIcons[log.action] || 'fas fa-info-circle'}"></i>
                </div>
                <div class="log-content">
                    <div class="log-header">
                        <span class="log-admin">${log.admin}</span>
                        <span class="log-action">${actionTexts[log.action] || log.action}</span>
                    </div>
                    <div class="log-details">
                        ${log.details.playerName ? `<span class="log-player">Spieler: ${log.details.playerName}</span>` : ''}
                        ${log.details.reason ? `<span class="log-reason">Grund: ${log.details.reason}</span>` : ''}
                        ${log.details.recordId ? `<span class="log-record">Eintrag-ID: ${log.details.recordId}</span>` : ''}
                    </div>
                    <div class="log-meta">
                        <span class="log-time">${new Date(log.timestamp).toLocaleString('de-DE')}</span>
                        ${log.ip ? `<span class="log-ip">IP: ${log.ip}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // NEUE METHODE: Logs exportieren
    exportLogs() {
        if (this.activityLogs.length === 0) {
            this.showNotification('Keine Logs zum Exportieren vorhanden', 'warning');
            return;
        }

        const logData = JSON.stringify(this.activityLogs, null, 2);
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nordstadt-admin-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.logActivity('export_logs', { count: this.activityLogs.length });
        this.showNotification('Logs erfolgreich exportiert', 'success');
    }

    // NEUE METHODE: Logs löschen
    clearLogs() {
        if (this.activityLogs.length === 0) {
            this.showNotification('Keine Logs zum Löschen vorhanden', 'warning');
            return;
        }

        if (confirm(`Möchtest du wirklich alle ${this.activityLogs.length} Log-Einträge löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
            this.activityLogs = [];
            localStorage.removeItem('nordstadt_admin_logs');
            this.showNotification('Alle Log-Einträge wurden gelöscht', 'success');
            this.logActivity('clear_logs', { clearedCount: this.activityLogs.length });
        }
    }

    // BESTEHENDE METHODEN ERWEITERN mit Logging:

    handleLogin() {
        const adminName = document.getElementById('adminLogin').value.trim();
        if (adminName) {
            this.currentAdmin = adminName;
            sessionStorage.setItem('nordstadt_admin', adminName);
            this.showApp();
            this.logActivity('login', { adminName: adminName });
            this.showNotification(`Willkommen, ${adminName}!`, 'success');
        }
    }

    handleLogout() {
        this.logActivity('logout', { adminName: this.currentAdmin });
        sessionStorage.removeItem('nordstadt_admin');
        this.currentAdmin = null;
        this.showLogin();
        this.showNotification('Erfolgreich ausgeloggt', 'info');
        this.toggleSidebar();
    }

    selectPlayer(player) {
        this.selectedPlayer = player;
        this.showSelectedPlayer();
        this.loadPlayerHistory();
        this.logActivity('player_select', { 
            playerId: player.id, 
            playerName: player.name 
        });
        
        if (this.isMobile) {
            this.toggleSidebar();
        }
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
                // Log die Aktion
                this.logActivity(formData.type, {
                    playerId: formData.playerId,
                    playerName: formData.playerName,
                    reason: formData.reason
                });

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
                // Finde den gelöschten Eintrag fürs Logging
                const deletedRecord = this.allRecords.find(record => record.id === this.pendingDeleteId);
                
                this.logActivity('delete_record', {
                    recordId: this.pendingDeleteId,
                    playerName: deletedRecord?.playerName,
                    recordType: deletedRecord?.type
                });

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

    // Event Listener für Log-Buttons erweitern
    setupEventListeners() {
        // ... bestehende Event Listener ...

        // NEUE: Logs anzeigen Button
        const viewLogsBtn = document.getElementById('viewLogsBtn');
        if (viewLogsBtn) {
            viewLogsBtn.addEventListener('click', () => {
                this.showActivityLogs();
                this.logActivity('view_logs');
            });
        }

        // NEUE: Logs exportieren Button
        const exportLogsBtn = document.getElementById('exportLogsBtn');
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', () => {
                this.exportLogs();
            });
        }

        // NEUE: Logs löschen Button
        const clearLogsBtn = document.getElementById('clearLogsBtn');
        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                this.clearLogs();
                // Schließe das Modal nach dem Löschen
                const modal = document.getElementById('activityLogModal');
                if (modal) modal.classList.remove('active');
            });
        }

        // NEUE: Log Modal schließen
        const closeLogsModal = document.getElementById('closeLogsModal');
        if (closeLogsModal) {
            closeLogsModal.addEventListener('click', () => {
                const modal = document.getElementById('activityLogModal');
                if (modal) modal.classList.remove('active');
            });
        }
    }

    // Beim Initialisieren Logs laden
    async init() {
        this.detectDeviceType();
        this.setupResponsiveListeners();
        this.checkLogin();
        this.loadLogsFromStorage(); // NEU: Logs laden
        this.setupEventListeners();
        await this.loadAllRecords();
    }
}