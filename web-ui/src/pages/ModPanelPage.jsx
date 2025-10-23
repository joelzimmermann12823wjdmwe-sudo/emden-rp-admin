import React, { useState } from 'react';
import PlayerSearchList from '../components/PlayerSearchList';
import PlayerDetailPanel from '../components/PlayerDetailPanel';
import './ModPanelPage.css';

const ModPanelPage = ({ playerList, adminName }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [activeTab, setActiveTab] = useState('Spieler');

    // Lokale Filterung
    const filteredPlayers = playerList.filter(player => {
        if (!searchTerm) return true;
        
        return player.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               String(player.id).includes(searchTerm);
    });

    return (
        <div className="modpanel-layout">
            
            {/* 1. Linke Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">NRP Admin Panel</div>
                <div className="current-user">Eingeloggt als: {adminName}</div>
                <nav>
                    <div 
                        className={`nav-item ${activeTab === 'Spieler' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Spieler')}
                    >
                        👥 Spieler-Übersicht
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'Logs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Logs')}
                    >
                        📜 Admin-Logs
                    </div>
                    <div 
                        className={`nav-item ${activeTab === 'Einstellungen' ? 'active' : ''}`}
                        onClick={() => setActiveTab('Einstellungen')}
                    >
                        ⚙️ Einstellungen
                    </div>
                </nav>
            </aside>

            {/* 2. Haupt-Inhalt */}
            <main className="main-content">
                <header className="main-header">
                    <h1>{activeTab}</h1>
                </header>
                
                {activeTab === 'Spieler' && (
                    <>
                        <input
                            type="text"
                            placeholder="Spieler suchen (Name oder ID)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        
                        <div className="player-management-area">
                            <PlayerSearchList 
                                players={filteredPlayers} 
                                onPlayerSelect={setSelectedPlayer}
                                selectedPlayerId={selectedPlayer ? selectedPlayer.id : null}
                            />
                            
                            {selectedPlayer && (
                                <PlayerDetailPanel player={selectedPlayer} />
                            )}
                        </div>
                    </>
                )}
                
                {activeTab === 'Logs' && <p className="placeholder">Log-Anzeige kommt hier rein...</p>}
                {activeTab === 'Einstellungen' && <p className="placeholder">Einstellungs-Formulare kommen hier rein...</p>}
                
            </main>
        </div>
    );
};
export default ModPanelPage;