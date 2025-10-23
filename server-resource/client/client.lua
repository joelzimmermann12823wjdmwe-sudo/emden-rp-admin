-- ===============================================
-- NORDSTADT RP ADMIN PANEL - CLIENT LOGIC
-- Handhabt NUI-Kommunikation, Events vom Server
-- und den Befehl zum Öffnen des Panels.
-- ===============================================

local NUI_IS_OPEN = false
local CurrentPlayers = {} -- Speichert die Liste lokal

-- #################################################
-- 1. NUI-CALLBACKS (Browser -> Client -> Server)
-- #################################################

-- Empfängt den Login-Versuch vom NUI (React)
RegisterNUICallback('requestLogin', function(data, cb)
    local adminName = data.adminName
    
    -- Hole ALLE Identifier des aktuell verbundenen Spielers (Steam, Discord, IP)
    local identifiers = GetPlayerIdentifiers(PlayerId())

    -- Sende die Anfrage, inklusive Identifier, an den Server
    TriggerServerEvent('nordstadt:attemptLogin', adminName, identifiers)

    cb({}) -- Immer einen Callback senden
end)

-- Empfängt die Admin-Aktion vom NUI
RegisterNUICallback('executeAction', function(data, cb)
    -- Sende die Aktion direkt an den Server zur Prüfung und Ausführung
    TriggerServerEvent('nordstadt:executeAction', data)
    
    cb({})
end)

-- NEU: Empfängt die Anforderung, Admin-Logs zu laden
RegisterNUICallback('requestAdminLogs', function(data, cb)
    -- Sende die Anfrage an den Server, die Logs zurückzusenden
    TriggerServerEvent('nordstadt:requestLogs')
    cb({})
end)

-- #################################################
-- 2. SERVER-EVENTS (Server -> Client -> Browser)
-- #################################################

-- Login erfolgreich: Panel anzeigen und Spielerliste empfangen
RegisterNetEvent('nordstadt:loginSuccess')
AddEventHandler('nordstadt:loginSuccess', function(data)
    -- NUI öffnen und Fokus setzen
    SetNuiFocus(true, true) 
    NUI_IS_OPEN = true
    
    -- Optional: Sende den Admin-Namen an das NUI
    SendNUIMessage({
        action = 'loginSuccess',
        name = data.name
    })
end)

-- Login fehlgeschlagen: Fehlermeldung anzeigen
RegisterNetEvent('nordstadt:loginFailed')
AddEventHandler('nordstadt:loginFailed', function(data)
    -- Schließe NUI-Fokus, falls es versehentlich offen war
    SetNuiFocus(false, false) 
    
    SendNUIMessage({
        action = 'loginFailed',
        message = data.message
    })
end)

-- Spielerliste vom Server empfangen
RegisterNetEvent('nordstadt:receivePlayerList')
AddEventHandler('nordstadt:receivePlayerList', function(playerList)
    CurrentPlayers = playerList
    
    -- Sende die Liste an das Vercel Frontend
    SendNUIMessage({
        action = 'updatePlayerList',
        players = CurrentPlayers
    })
end)

-- NEU: Admin-Logs vom Server empfangen
RegisterNetEvent('nordstadt:receiveAdminLogs')
AddEventHandler('nordstadt:receiveAdminLogs', function(logs)
    -- Leite die Log-Daten an das React-Frontend weiter
    SendNUIMessage({
        action = 'updateAdminLogs',
        logs = logs
    })
end)

-- #################################################
-- 3. BEFEHLE & FOKUS
-- #################################################

-- Befehl zum Öffnen des Panels (aus fxmanifest.lua: command 'modpanel')
RegisterCommand('modpanel', function()
    if not NUI_IS_OPEN then
        -- Zeige die UI an und setze Fokus
        SetNuiFocus(true, true)
        NUI_IS_OPEN = true
    end
end, false)

-- Listener für ESC, um das Panel zu schließen
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        -- 322 ist die Taste ESC
        if NUI_IS_OPEN and IsControlJustReleased(0, 322) then 
            SetNuiFocus(false, false)
            NUI_IS_OPEN = false
            -- Sendet Event an React, um den Zustand zurückzusetzen/Panel auszublenden
            SendNUIMessage({ action = 'hidePanel' }) 
        end
    end
end)