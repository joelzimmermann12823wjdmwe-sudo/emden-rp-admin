// public/script.js

const API_BASE = '/api/admin'; 
const SEARCH_API = '/api/search-roblox'; 
let allRecords = []; // Globale Speicherung aller geladenen Einträge

document.addEventListener('DOMContentLoaded', () => {
    // Initialisierung der Funktionen
    handleAdminLogin();
    handleThemeToggle();
    loadAndDisplayAllRecords();
    
    // Event-Listener
    document.getElementById('record-form').addEventListener('submit', handleNewRecord);
    document.getElementById('player-search').addEventListener('input', debounce(handlePlayerSearch, 300));
    document.getElementById('search-results').addEventListener('click', (e) => {
        if (e.target.tagName === 'LI' && e.target.dataset.id) {
            selectPlayer({ 
                id: e.target.dataset.id, 
                name: e.target.dataset.name 
            });
        }
    });
});

// --- HELPER FUNKTIONEN ---

function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// --- 1. ADMIN ANMELDUNG ---

function handleAdminLogin() {
    let adminName = sessionStorage.getItem('adminName');
    
    while (!adminName || adminName.trim() === '') {
        adminName = prompt('Bitte gib deinen Admin-Namen ein (z.B. Joel.Z):');
        if (adminName) {
            sessionStorage.setItem('adminName', adminName.trim());
        }
    }
    document.getElementById('admin-name-field').value = adminName.trim();
}

// --- 2. THEME UMSCHALTER ---

function handleThemeToggle() {
    const toggleButton = document.getElementById('theme-toggle');
    
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    toggleButton.innerHTML = currentTheme === 'dark' ? '🌙' : '☀️';

    toggleButton.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        const newTheme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        toggleButton.innerHTML = isDark ? '🌙' : '☀️';
    });
}

// --- 3. DATENVERWALTUNG (CRUD) ---

async function loadAndDisplayAllRecords() {
    try {
        const response = await fetch(API_BASE);
        allRecords = await response.json();
        displayRecords(allRecords);
    } catch (error) {
        console.error('Fehler beim Laden der Einträge:', error);
        document.getElementById('records-tbody').innerHTML = '<tr><td colspan="6">Fehler beim Laden der Historie.</td></tr>';
    }
}

function displayRecords(recordsToDisplay) {
    const tbody = document.getElementById('records-tbody');
    tbody.innerHTML = ''; 

    if (recordsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Keine Einträge vorhanden.</td></tr>';
        return;
    }

    recordsToDisplay.forEach(record => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${new Date(record.timestamp).toLocaleDateString('de-DE')}</td>
            <td>${record.type}</td>
            <td>${record.playerName} (${record.playerId})</td>
            <td>${record.adminName}</td>
            <td>${record.reason.substring(0, 50)}...</td>
            <td><button class="delete-btn" data-id="${record.id}">Löschen</button></td>
        `;
    });

    // Listener für Lösch-Buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteRecord);
    });
}

async function handleNewRecord(event) {
    event.preventDefault();
    
    const record = {
        type: document.getElementById('type').value,
        playerId: document.getElementById('player-id').value,
        playerName: document.getElementById('player-name').value,
        reason: document.getElementById('reason').value,
        adminName: document.getElementById('admin-name-field').value,
        timestamp: new Date().toISOString()
    };

    if (!record.playerId) {
        alert('Bitte wähle zuerst einen Spieler über die Roblox-Suche aus.');
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });

        if (response.ok) {
            alert('Eintrag erfolgreich gespeichert!');
            // Formular leeren
            document.getElementById('record-form').reset();
            document.getElementById('player-id').value = '';
            document.getElementById('player-name').value = ''; 
            document.getElementById('player-search').value = '';

            loadAndDisplayAllRecords(); // Tabelle neu laden
        } else {
            alert('Fehler beim Speichern des Eintrags.');
        }
    } catch (error) {
        console.error('Fehler beim POST-Request:', error);
        alert('Interner Serverfehler beim Speichern.');
    }
}

async function handleDeleteRecord(event) {
    const id = event.target.dataset.id;
    if (!confirm('Sicher, dass dieser Eintrag gelöscht werden soll?')) {
        return;
    }

    try {
        const response = await fetch(API_BASE, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (response.ok) {
            loadAndDisplayAllRecords(); // Tabelle neu laden
        } else {
            alert('Fehler beim Löschen des Eintrags.');
        }
    } catch (error) {
        console.error('Fehler beim DELETE-Request:', error);
        alert('Interner Serverfehler beim Löschen.');
    }
}

// --- 4. ROBLOX SUCHE UND SPIELERAUSWAHL ---

async function handlePlayerSearch(event) {
    const query = event.target.value.trim();
    const resultsUl = document.getElementById('search-results');
    resultsUl.innerHTML = '';
    
    // Verstecke die Liste, wenn die Suche leer ist
    if (query.length < 3) {
        resultsUl.style.display = 'none';
        return;
    }
    
    resultsUl.style.display = 'block';

    try {
        const response = await fetch(`${SEARCH_API}?query=${encodeURIComponent(query)}`);
        const results = await response.json();

        if (results.length > 0) {
            results.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.name} (ID: ${user.id})`;
                li.dataset.id = user.id;
                li.dataset.name = user.name;
                resultsUl.appendChild(li);
            });
        } else {
            resultsUl.innerHTML = '<li class="no-results">Keine Spieler gefunden.</li>';
        }

    } catch (error) {
        console.error('Fehler bei der Roblox-Suche:', error);
        resultsUl.innerHTML = '<li class="no-results">Suchdienst momentan nicht verfügbar.</li>';
    }
}

function selectPlayer(user) {
    // 1. Formularfelder befüllen
    document.getElementById('player-id').value = user.id;
    document.getElementById('player-name').value = user.name;
    
    // 2. Suchleiste leeren und Ergebnisse verstecken
    document.getElementById('player-search').value = user.name;
    document.getElementById('search-results').innerHTML = '';
    document.getElementById('search-results').style.display = 'none';

    // 3. Einträge filtern und anzeigen
    filterAndDisplayRecords(user.id, user.name);
}

function filterAndDisplayRecords(playerId, playerName) {
    document.getElementById('history-title').textContent = `Historie für ${playerName} (ID: ${playerId})`;
    
    // Filtern der globalen Liste aller Einträge
    const filtered = allRecords.filter(record => record.playerId === playerId);
    displayRecords(filtered);
}