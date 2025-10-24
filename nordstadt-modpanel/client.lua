-- /nordstadt-modpanel/client.lua

-- Resource-Name (muss mit dem Ordnernamen übereinstimmen)
local ResourceName = GetCurrentResourceName()
local IsPanelVisible = false

-- Funktion, um NUI-Daten an die Web-UI zu senden
local function SendNuiMessage(action, data)
    SendNUIMessage({
        type = action,
        data = data
    })
end

-- Funktion zum Anzeigen des Panels
local function ShowPanel()
    SetNuiFocus(true, true)
    SendNuiMessage('showPanel')
    IsPanelVisible = true
end

-- Funktion zum Ausblenden des Panels
local function HidePanel()
    SetNuiFocus(false, false)
    SendNuiMessage('hidePanel')
    IsPanelVisible = false
end

-- Listener für die FiveM-Events, die das NUI-Panel steuern
RegisterNetEvent('nordstadt-modpanel:show', function()
    ShowPanel()
    -- Request the initial player list (optional, can be done on login)
    -- TriggerServerEvent('nordstadt-modpanel:requestInitialData')
end)

-- Listener für die NUI-Kommunikation von der Web-UI (JS -> Lua)
RegisterNUICallback('requestLogin', function(data, cb)
    -- Sendet die Login-Anforderung an den Server
    TriggerServerEvent('nordstadt-modpanel:server:requestLogin', data.adminName)
    -- Bestätigung an NUI, dass die Nachricht angekommen ist (wird von FiveM benötigt)
    cb('ok')
end)

RegisterNUICallback('requestPlayerUpdate', function(data, cb)
    -- Fordert eine aktualisierte Spielerliste vom Server an
    TriggerServerEvent('nordstadt-modpanel:server:requestPlayerList')
    cb('ok')
end)

RegisterNUICallback('searchPlayers', function(data, cb)
    -- Sendet die Suchanfrage an den Server
    TriggerServerEvent('nordstadt-modpanel:server:searchPlayers', data.query)
    cb('ok')
end)

-- NUI-Callbacks für Aktionen (Warnen/Bannen)
RegisterNUICallback('warnPlayer', function(data, cb)
    TriggerServerEvent('nordstadt-modpanel:server:warnPlayer', data.serverId, data.name)
    cb('ok')
end)

RegisterNUICallback('banPlayer', function(data, cb)
    TriggerServerEvent('nordstadt-modpanel:server:banPlayer', data.serverId, data.name)
    cb('ok')
end)

-- Event vom Server, das dem Client mitteilt, dass der Login erfolgreich war
RegisterNetEvent('nordstadt-modpanel:client:loginSuccess', function(adminName)
    SendNuiMessage('loginSuccess', { name = adminName })
    -- Jetzt kann die Spielerliste angefordert werden, wenn der Screen wechselt
    TriggerServerEvent('nordstadt-modpanel:server:requestPlayerList')
end)

-- Event vom Server bei fehlgeschlagenem Login
RegisterNetEvent('nordstadt-modpanel:client:loginFailed', function(message)
    SendNuiMessage('loginFailed', { message = message })
end)

-- Event vom Server mit aktualisierter Spielerliste
RegisterNetEvent('nordstadt-modpanel:client:updatePlayers', function(players)
    SendNuiMessage('updatePlayers', { players = players })
end)


-- Tastendruck-Handler (Beispiel: Standardmäßig F9 zum Öffnen/Schließen)
-- Stelle sicher, dass dies in deiner resource.lua/fxmanifest.lua definiert ist: 'is_admin_panel_key'
RegisterCommand('+openmodpanel', function()
    if not IsPanelVisible then
        ShowPanel()
    else
        HidePanel()
    end
end, false)

RegisterCommand('-openmodpanel', function()
    -- Wird nur für Tastendruck-Registrierung benötigt, da wir Toggeln
end, false)

-- Standard-Tastenbelegung (kann je nach Framework/Bedürfnissen angepasst werden)
-- Bind key to command in your fxmanifest.lua:
-- 'bind "keyboard" "F9" "+openmodpanel"'

-- Schließe das Panel, wenn ESC gedrückt wird (wichtig für UX)
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if IsPanelVisible and IsControlJustPressed(0, 322) then -- 322 ist ESC
            HidePanel()
        end
    end
end)

-- Standardmäßig Panel verstecken, wenn die Resource startet
HidePanel()