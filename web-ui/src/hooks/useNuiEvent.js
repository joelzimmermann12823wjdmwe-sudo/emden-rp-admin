import { useEffect } from 'react';

/**
 * Hook zum Empfangen von Nachrichten vom FiveM-Client (Lua) an das NUI (React).
 * @param {string} actionName - Der 'action'-Wert im gesendeten Nachrichten-Objekt (z.B. 'loginSuccess').
 * @param {function} handler - Die Callback-Funktion, die mit den Daten ausgeführt wird.
 */
export const useNuiEvent = (actionName, handler) => {
    useEffect(() => {
        const eventListener = (event) => {
            const { action, ...data } = event.data;
            if (action === actionName) {
                // Debugging-Ausgabe
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[NUI RECEIVE] Action: ${actionName}, Data:`, data);
                }
                handler(data);
            }
        };

        window.addEventListener('message', eventListener);

        // Cleanup: Event Listener entfernen, wenn die Komponente unmounted wird
        return () => window.removeEventListener('message', eventListener);
    }, [actionName, handler]);
};