import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login.jsx';
import ModPanelPage from './pages/ModPanelPage.jsx';
import AdminLogViewer from './pages/AdminLogViewer.jsx';
import PlayerSearch from './pages/PlayerSearch.jsx';
import useNuiEvent from './hooks/useNuiEvent.js';
import './index.css';
import './components/Components.css'; // Füge diese Zeile hinzu, um das Design zu laden!

// ========================================================
// WICHTIG: DIES IST EINE TEMPORÄRE ÄNDERUNG, UM SICHTBARKEIT ZU ERZWINGEN.
// NACH DEM TEST MUSS useState(true) ZURÜCKGESETZT WERDEN AUF useState(false)!
// ========================================================
const App = () => {
    const [page, setPage] = useState('login'); // 'login' | 'playerSearch' | 'adminLogs'
    const [adminName, setAdminName] = useState('TEST-ADMIN'); // Testwert
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Ändere auf true für Panel-Test
    const [error, setError] = useState(null);
    
    // TEMPORÄRE ÄNDERUNG FÜR SICHTBARKEIT:
    const [isVisible, setIsVisible] = useState(true); 

    // --- NUI-Events (werden für den reinen Browser-Test ignoriert) ---

    useNuiEvent('nordstadt:loginSuccess', useCallback((data) => {
        setIsAuthenticated(true);
        setAdminName(data.name);
        setIsVisible(true);
        setError(null);
        setPage('playerSearch');
    }, []));

    useNuiEvent('nordstadt:loginFailed', useCallback((data) => {
        setIsAuthenticated(false);
        setError(data.message);
        setIsVisible(true);
    }, []));

    useNuiEvent('hidePanel', useCallback(() => {
        setIsVisible(false);
        // setIsAuthenticated(false); // Optionale Zurücksetzung
        // setPage('login');
    }, []));
    
    // --- Dummy-Funktionen für Browser-Test (Post-Messages funktionieren nicht) ---

    const handleLogin = (name) => {
        // Hier simulieren wir den Erfolg direkt im Browser
        if (name && name.length > 2) {
            setIsAuthenticated(true);
            setAdminName(name);
            setPage('playerSearch');
        } else {
            setError("Bitte gib einen gültigen Namen ein.");
        }
    };

    const handleLogout = () => {
        // Nur für den Browser-Test
        setIsAuthenticated(false);
        setAdminName('');
        setPage('login');
    };


    // --- Render Logik ---

    if (isVisible) {
        // Rendere immer den Hauptcontainer, wenn isVisible = true
        return (
            <div className={`app-container active`}>
                {/* Zeige Login ODER ModPanel, je nach Authentifizierungs-Status */}
                {!isAuthenticated ? (
                    <Login onLogin={handleLogin} errorMessage={error} />
                ) : (
                    <ModPanelPage 
                        adminName={adminName} 
                        currentPage={page} 
                        setPage={setPage}
                        onLogout={handleLogout}
                    >
                        {/* Hier die Seiten-Komponenten laden */}
                        {page === 'playerSearch' && <PlayerSearch />}
                        {page === 'adminLogs' && <AdminLogViewer />}
                        {/* Weitere Seiten... */}
                    </ModPanelPage>
                )}
            </div>
        );
    }
    
    // Im Spiel würde dies ausgeführt, wenn es unsichtbar ist
    return null;
};

export default App;