import React, { useState, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import ModPanelPage from './pages/ModPanelPage';
import { useNuiCallback } from './hooks/useNuiCallback';
import { useNuiEvent } from './hooks/useNuiEvent';
import './App.css'; // Für allgemeines App-Layout

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [adminName, setAdminName] = useState('');
    const [playerList, setPlayerList] = useState([]);
    
    const requestLogin = useNuiCallback('requestLogin'); 
    
    // --- NUI Event Listener ---
    
    const handleLoginSuccess = useCallback((data) => {
        setIsLoggedIn(true);
        setAdminName(data.name);
        // Hier sollte die NUI-Fokus-Steuerung in client.lua erfolgen!
    }, []);

    const handleLoginFailed = useCallback((data) => {
        alert(`Login fehlgeschlagen: ${data.message}`);
        setIsLoggedIn(false);
    }, []);

    const handleUpdatePlayerList = useCallback((data) => {
        // Liste beim Empfang sofort speichern
        setPlayerList(data.players || []);
    }, []);

    useNuiEvent('loginSuccess', handleLoginSuccess);
    useNuiEvent('loginFailed', handleLoginFailed);
    useNuiEvent('updatePlayerList', handleUpdatePlayerList);

    // --- Login Handler ---
    
    const handleLogin = (name) => {
        if (name) {
            // Sende den Namen (ohne Passwort) an den FiveM Client
            requestLogin({ adminName: name });
        }
    };
    
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