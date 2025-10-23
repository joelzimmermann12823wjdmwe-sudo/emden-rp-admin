// Funktion, um den Ressourcennamen in einer FiveM NUI Umgebung abzurufen
const GetParentResourceName = () => window.GetParentResourceName ? window.GetParentResourceName() : 'nordstadt-modpanel'; 

/**
 * Hook zum Senden von Aktionen an den FiveM-Client.
 * @param {string} eventName - Der Name des NUI-Callback-Events im Lua-Code.
 */
export const useNuiCallback = (eventName) => {
    return (data) => {
        // Debugging-Ausgabe
        if (process.env.NODE_ENV === 'development') {
            console.log(`[NUI SEND] Event: ${eventName}, Data:`, data);
        }
        
        fetch(`https://${GetParentResourceName()}/${eventName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data),
        }).catch(error => {
            console.error(`Fehler beim Senden der NUI-Nachricht (${eventName}):`, error);
        });
    };
};