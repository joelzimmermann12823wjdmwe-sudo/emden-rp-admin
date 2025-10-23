// web-ui/src/Login.js (Auszug)

function handleLoginAttempt() {
    // Nur Admin-Name wird benötigt
    const adminName = document.getElementById('admin-name').value;
    
    // Senden der Daten an das FiveM Client-Skript
    fetch(`https://${GetParentResourceName()}/requestLogin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            adminName: adminName // Kein Passwort mehr
        })
    }).then(/* ... */);
}