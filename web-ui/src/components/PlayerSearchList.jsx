import React from 'react';
import './Components.css'; // Für player-item Styles

const PlayerSearchList = ({ players, onPlayerSelect, selectedPlayerId }) => {
    return (
        <div className="player-list-container">
            <h4 className="list-title">Gefundene Spieler ({players.length})</h4>
            {players.map(player => (
                <div
                    key={player.id}
                    className={`player-item ${player.id === selectedPlayerId ? 'selected' : ''}`}
                    onClick={() => onPlayerSelect(player)}
                >
                    <span className="player-name">{player.name}</span>
                    <span className="player-id">ID: {player.id}</span>
                </div>
            ))}
            {players.length === 0 && <p className="secondary-text">Keine Spieler gefunden.</p>}
        </div>
    );
};
export default PlayerSearchList;