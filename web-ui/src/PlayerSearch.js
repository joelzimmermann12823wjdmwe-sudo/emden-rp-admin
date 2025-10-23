// web-ui/src/PlayerSearch.js (Muss in der Hauptpanel-Ansicht sein)

let globalPlayerList = []; // Wird beim 'updatePlayerList' Event gefüllt

window.addEventListener('message', function(event) {
    if (event.data.action === 'updatePlayerList') {
        globalPlayerList = event.data.players;
        displayPlayerList(globalPlayerList); // Zeigt die initiale, ungefilterte Liste
    }
});


function handleSearchInput(inputElement) {
    const searchTerm = inputElement.value.toLowerCase();
    
    // Lokale Filterung der Liste
    const filteredList = globalPlayerList.filter(player => 
        player.name.toLowerCase().includes(searchTerm) || 
        String(player.id).includes(searchTerm) // Suchen nach Server-ID
    );
    
    displayPlayerList(filteredList); // Aktualisiert die Anzeige
}

function displayPlayerList(players) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';
    
    players.forEach(player => {
        const listItem = document.createElement('div');
        listItem.className = 'player-item';
        listItem.textContent = `${player.name} (ID: ${player.id})`;
        
        // Füge einen Event-Listener hinzu, um den Spieler auszuwählen
        listItem.onclick = () => selectPlayer(player.id, player.name);
        
        resultsContainer.appendChild(listItem);
    });
}