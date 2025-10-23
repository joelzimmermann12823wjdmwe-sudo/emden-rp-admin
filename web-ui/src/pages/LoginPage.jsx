import React, { useState } from 'react';
import './LoginPage.css'; 

const LoginPage = ({ onLogin }) => {
    const [name, setName] = useState('');

    const handleLogin = () => {
        onLogin(name); 
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                {/* Füge hier dein Nordstadt RP Logo ein */}
                <h2 className="title">🛡️ Team-Login</h2>
                
                <input
                    id="admin-name"
                    type="text"
                    placeholder="Deinen Team-Namen eingeben"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="input-field large"
                    autoFocus
                />
                
                <button 
                    onClick={handleLogin} 
                    className="login-button primary"
                >
                    Einloggen
                </button>
            </div>
        </div>
    );
};
export default LoginPage;