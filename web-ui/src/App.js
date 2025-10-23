// /workspaces/emden-rp-admin/web-ui/src/App.jsx
import './index.css'; 
import './components/Components.css';
import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login.jsx';
import ModPanelPage from './pages/ModPanelPage.jsx';
import AdminLogViewer from './pages/AdminLogViewer.jsx'; // Füge dies hinzu, falls es fehlt
import PlayerSearch from './pages/PlayerSearch.jsx';     // Füge dies hinzu, falls es fehlt
import useNuiEvent from './hooks/useNuiEvent.js';         // Füge dies hinzu, falls es fehlt
import './index.css';

// ========================================================
// ACHTUNG: IST SICHTBAR, UM DAS DESIGN ZU PRÜFEN.
// NACH DEM TEST ZURÜCKSETZEN AUF: useState(false)
// ========================================================
const App = () => {
    const [page, setPage] = useState('login'); // 'login' | 'playerSearch' | 'adminLogs'
    const [adminName, setAdminName] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);
    
    // TEMPORÄRE ÄNDERUNG: Setze dies auf TRUE, um das Design zu sehen!
    const [isVisible, setIsVisible] = useState(false); 

    // --- NUI-Events ---

    // Event vom Server, um das Panel anzuzeigen und den Login-Status zu setzen
    useNuiEvent('nordstadt:loginSuccess', useCallback((data) => {
        setIsAuthenticated(true);
        setAdminName(data.name);
        setIsVisible(true); // Macht das Panel sichtbar
        setError(null);
        setPage('playerSearch'); // Gehe nach Login direkt zur Spielerliste
    }, []));

    // Event vom Server, um Login-Fehler anzuzeigen
    useNuiEvent('nordstadt:loginFailed', useCallback((data) => {
        setIsAuthenticated(false);
        setError(data.message);
        setIsVisible(true);
    }, []));

    // Event vom Client, um das Panel auszublenden (z.B. bei ESC)
    useNuiEvent('hidePanel', useCallback(() => {
        setIsVisible(false);
        // Optional: Zustand zurücksetzen, wenn Panel geschlossen wird
        // setIsAuthenticated(false);
        // setPage('login');
    }, []));
    
    // --- Login/Logout Funktionen ---

    const handleLogin = (name) => {
        // Die Login-Logik wird im NUI Callback (client.lua) ausgeführt.
        // Hier wird nur der Versuch getriggert.
        fetch(`https://nordstadt-modpanel/requestLogin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminName: name })
        }).then(response => response.json());
        
        // Zeige den Ladezustand an, wenn der Login getriggert wird
        setError("Login wird geprüft...");
    };

    const handleLogout = () => {
        // Sendet eine Nachricht an das Client-Skript (optional: um den NUI-Fokus zu entfernen)
        fetch(`https://nordstadt-modpanel/hidePanel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        // Zustände zurücksetzen
        setIsAuthenticated(false);
        setAdminName('');
        setIsVisible(false);
        setError(null);
        setPage('login');
    };


    // --- Render Logik ---

    if (!isAuthenticated && isVisible) {
        return (
            <div className={`app-container ${isVisible ? 'active' : ''}`}>
                <Login onLogin={handleLogin} errorMessage={error} />
            </div>
        );
    }
    
    if (isAuthenticated && isVisible) {
        return (
            <div className={`app-container ${isVisible ? 'active' : ''}`}>
                <ModPanelPage 
                    adminName={adminName} 
                    currentPage={page} 
                    setPage={setPage}
                    onLogout={handleLogout}
                >
                    {/* Wähle die anzuzeigende Seite basierend auf dem State 'page' */}
                    {page === 'playerSearch' && <PlayerSearch />}
                    {page === 'adminLogs' && <AdminLogViewer />}
                    {/* Füge hier weitere Seiten hinzu */}
                </ModPanelPage>
            </div>
        );
    }
    
    // Wenn isVisible = false (Standardzustand im Spiel)
    return <div className={`app-container ${isVisible ? 'active' : ''}`}></div>;
};

export default App;