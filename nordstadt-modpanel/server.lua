-- /nordstadt-modpanel/server.lua

local ESX = exports['es_extended']:getSharedObject() -- Beispiel für ESX-Framework-Integration

-- Funktion zum Senden einer Nachricht an einen bestimmten Client
local function SendClientMessage(source, action, data)
    TriggerClientEvent('nordstadt-modpanel:client:' .. action, source, data)
end

-- === HILFSFUNKTIONEN ===

-- Funktion zum Abrufen aller Spielerdaten (Dummy-Daten für den Test)
local function GetFormattedPlayerList()
    local players = {}
    for _, player in ipairs(GetPlayers()) do
        local serverId = tonumber(player)
        
        -- Dummy Daten (Muss durch echte Framework-Abfragen ersetzt werden)
        local playerName = GetPlayerName(serverId)
        local robloxId = 'N/A' -- Hier müsste die Roblox ID aus dem Framework geholt werden
        local avatarUrl = 'https://via.placeholder.com/64?text=' .. playerName:sub(1, 1)

        -- Hole Roblox ID (Beispiel mit Identifiern)
        for _, identifier in ipairs(GetPlayerIdentifiers(serverId)) do
            if identifier:sub(1, 7) == 'roblox:' then
                robloxId = identifier:sub(8)
                break
            end
        end

        table.insert(players, {
            serverId = serverId,
            name = playerName,
            robloxId = robloxId,
            avatarUrl = avatarUrl
        })
    end
    return players
end


-- === NUI CALLBACKS (JS -> SERVER) ===

-- Login Anfrage
RegisterNetEvent('nordstadt-modpanel:server:requestLogin', function(adminName)
    local source = source
    
    -- ! WICHTIG: ECHTE BERECHTIGUNGSPRÜFUNG HIER IMPLEMENTIEREN
    -- Prüft, ob der Name (oder besser: die Identifier) Admin-Rechte haben.
    
    -- DUMMY-PRÜFUNG: Nur "Joel.Z" darf rein
    if adminName == "Joel.Z" then
        -- Erfolgreich
        SendClientMessage(source, 'loginSuccess', adminName)
        print(string.format('^2[AdminPanel]^7 %s (ID: %s) hat sich eingeloggt.^7', adminName, source))
    else
        -- Fehlgeschlagen
        SendClientMessage(source, 'loginFailed', 'Fehler: Du hast keine Admin-Rechte.')
        print(string.format('^3[AdminPanel]^7 Login-Versuch von %s (ID: %s) ist fehlgeschlagen.^7', adminName, source))
    end
end)

-- Spielerliste abrufen
RegisterNetEvent('nordstadt-modpanel:server:requestPlayerList', function()
    local source = source
    -- Hier sollte eine erneute Admin-Prüfung erfolgen, um Spam zu verhindern
    
    local playerList = GetFormattedPlayerList()
    SendClientMessage(source, 'updatePlayers', playerList)
end)

-- Spieler suchen
RegisterNetEvent('nordstadt-modpanel:server:searchPlayers', function(query)
    local source = source
    local queryLower = string.lower(query or "")
    local allPlayers = GetFormattedPlayerList()
    local filteredPlayers = {}
    
    if queryLower == "" then
        filteredPlayers = allPlayers
    else
        for _, player in ipairs(allPlayers) do
            -- Suche nach Name oder Server ID
            if string.find(string.lower(player.name), queryLower) or tostring(player.serverId) == queryLower then
                table.insert(filteredPlayers, player)
            end
        end
    end

    SendClientMessage(source, 'updatePlayers', filteredPlayers)
end)

-- Spieler verwarnen
RegisterNetEvent('nordstadt-modpanel:server:warnPlayer', function(targetServerId, targetName)
    local source = source
    -- ! WICHTIG: Admin-Rechte des 'source' Spielers prüfen!
    
    if targetServerId and targetName then
        print(string.format('^1[ADMIN ACTION]^7 Admin %s (ID: %s) hat Spieler %s (ID: %s) verwarnt!^7', GetPlayerName(source), source, targetName, targetServerId))
        
        -- HIER: Datenbank-Eintrag für Verwarnung ausführen (siehe unten)
        
        -- Nachricht an den Zielspieler (optional)
        TriggerClientEvent('chat:addMessage', targetServerId, {
            color = { 255, 165, 0 },
            args = {'[SYSTEM]', 'Du wurdest von einem Admin verwarnt.'}
        })

    end
end)

-- Spieler bannen
RegisterNetEvent('nordstadt-modpanel:server:banPlayer', function(targetServerId, targetName)
    local source = source
    -- ! WICHTIG: Höchste Admin-Rechte des 'source' Spielers prüfen!
    
    if targetServerId and targetName then
        print(string.format('^4[ADMIN ACTION - BAN]^7 Admin %s (ID: %s) hat Spieler %s (ID: %s) gebannt!^7', GetPlayerName(source), source, targetName, targetServerId))

        -- HIER: Datenbank-Eintrag für Ban und eigentliche Ban-Logik ausführen

        -- Beispiel für einen temporären Ban (Muss an dein Ban-System angepasst werden)
        -- DropPlayer(targetServerId, 'Du wurdest permanent gebannt. Grund: Adminpanel Test')

    end
end)