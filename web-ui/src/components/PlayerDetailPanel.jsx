import React from 'react';
import { useNuiCallback } from '../hooks/useNuiCallback'; 
import './Components.css'; // Für Button Styles

const PlayerDetailPanel = ({ player }) => {
    const executeAction = useNuiCallback('executeAction'); 

    const handleKick = () => {
        const reason = prompt(`Kick-Grund für ${player.name}:`);
        if (reason && player.id) {
            executeAction({
                action: 'kick',
                targetId: player.id,
                reason: reason
            });
        }
    };

    const handleBan = () => {
        const reason = prompt(`Ban-Grund für ${player.name}:`);
        if (reason && player.id) {
             executeAction({
                action: 'ban',
                targetId: player.id,
                reason: reason
            });
        }
    };

    const handleRevive = () => {
         if (player.id) {
             executeAction({
                action: 'revive',
                targetId: player.id,
            });
        }
    };

    return (
        <div className="player-detail-panel">
            <h3>Details & Aktionen</h3>
            <div className="detail-info">
                <p><strong>Server-ID:</strong> <span>{player.id}</span></p>
                {/* Hier könnten weitere Infos wie Steam-ID stehen, wenn vom Server gesendet */}
            </div>

            <div className="action-buttons-group">
                <button 
                    onClick={handleKick} 
                    className="action-button danger"
                >
                    💥 Kick
                </button>
                <button 
                    onClick={handleBan} 
                    className="action-button danger"
                >
                    ⛔ Ban
                </button>
                <button 
                    onClick={handleRevive} 
                    className="action-button primary"
                >
                    ❤️ Revive
                </button>
                {/* Füge weitere Buttons hier hinzu */}
            </div>
        </div>
    );
};

export default PlayerDetailPanel;