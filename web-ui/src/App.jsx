// web-ui/src/App.jsx

import React, { useState, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import ModPanelPage from './pages/ModPanelPage';
import { useNuiCallback } from './hooks/useNuiCallback';
import { useNuiEvent } from './hooks/useNuiEvent';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminName, setAdminName] = useState('');
    const [playerList, setPlayerList] = useState([]);
    
    // Hook zum Senden des Login-Versuchs an FiveM Client (NUI Callback: 'requestLogin')
    const requestLogin = useNuiCallback('requestLogin'); 
    
    // --- NUI Event Listener ---
    
    // 1. Login-Erfolg vom Server empfangen
    const handleLoginSuccess = useCallback((data) => {
        setIsLoggedIn(true);
        setAdminName(data.name);
        // Optional: Blende NUI-Fokus aus, wenn das Panel nicht sofort geöffnet wird
        // SetNuiFocus(false, false) müsste im client.lua nachgereicht werden.
    }, []);

    // 2. Login-Fehler vom Server empfangen
    const handleLoginFailed = useCallback((data) => {
        alert(`Login fehlgeschlagen: ${data.message}`);
    }, []);

    // 3. Spielerliste vom Server empfangen (siehe Schritt 4.2)
    const handleUpdatePlayerList = useCallback((data) => {
        setPlayerList(data.players || []);
    }, []);

    useNuiEvent('loginSuccess', handleLoginSuccess);
    useNuiEvent('loginFailed', handleLoginFailed);
    useNuiEvent('updatePlayerList', handleUpdatePlayerList);

    // --- Login Handler ---
    
    const handleLogin = (name) => {
        if (name) {
            // Sende den Namen an den FiveM Client (wird an Server weitergeleitet)
            requestLogin({ adminName: name });
        }
    };
    
    // Wenn du das Panel auch wieder schließen können musst (z.B. mit ESC)
    // useNuiEvent('hidePanel', () => setIsLoggedIn(false)); 

    return (
        <div className="app-container">
            {isLoggedIn ? (
                <ModPanelPage playerList={playerList} adminName={adminName} />
            ) : (
                <LoginPage onLogin={handleLogin} />
            )}
        </div>
    );
};

export default App;