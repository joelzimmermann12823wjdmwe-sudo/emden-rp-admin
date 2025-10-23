-- ===============================================
-- NORDSTADT RP ADMIN PANEL - SERVER LOGIC
-- Enthält Login, Admin-Aktionen, Spielerlisten und Log-Verwaltung.
-- ===============================================

local AdminLogs = {} -- Speichert alle Admin-Aktionen im RAM
local LogID = 1      -- Einfacher Zähler für die Log-Einträge

-- Hilfsfunktion: Ruft die aktuelle Spielerliste ab
function GetCurrentPlayerList()
    local players = {}
    for _, playerID in ipairs(GetPlayers()) do
        local name = GetPlayerName(playerID)
        table.insert(players, {
            id = playerID,       -- Die FiveM Server ID
            name = name,
        })
    end
    return players
end

-- Hilfsfunktion: Fügt einen neuen Eintrag zum Admin-Log hinzu
function AddAdminLog(adminName, targetName, action, reason)
    local entry = {
        id = LogID,
        time = os.date("%H:%M:%S"), -- Aktuelle Uhrzeit
        admin = adminName,
        target = targetName,
        action = action,
        reason = reason,
        type = action -- Typ (kick, ban, revive)
    }
    table.insert(AdminLogs, 1, entry) -- Fügt den Eintrag am Anfang ein (neueste zuerst)
    LogID = LogID + 1
end

-- #################################################
-- 1. LOGIN (NUI -> SERVER)
-- #################################################

AddEventHandler('nordstadt:attemptLogin', function(adminName, clientIdentifiers)
    local src = source
    
    -- 1. Hole den Identifier aus der DB basierend auf dem eingegebenen Namen
    MySQL.Async.fetchAll('SELECT identifier FROM nordstadt_teamler WHERE admin_name = @name', { ['@name'] = adminName }, function(result)
        
        if not result or not result[1] then
            -- Admin-Name nicht gefunden
            TriggerClientEvent('nordstadt:loginFailed', src, { message = 'Team-Name nicht gefunden. Bist du registriert?' })
            return
        end
        
        local dbIdentifier = result[1].identifier
            
        -- 2. Kritische Sicherheitsprüfung: Stimmt der Identifier überein?
        local identifierFound = false
        for _, id in ipairs(clientIdentifiers) do
            if id == dbIdentifier then
                identifierFound = true
                break
            end
        end

        if identifierFound then
            -- Erfolg: Login-Bestätigung an Client
            TriggerClientEvent('nordstadt:loginSuccess', src, {name = adminName}) 
            
            -- Setze den Rang für die Berechtigungsprüfung
            SetPlayerVariable(src, 'adminRank', 1) 
            
            -- Sende die aktuelle Spielerliste an den eingeloggten Admin
            local playerList = GetCurrentPlayerList()
            TriggerClientEvent('nordstadt:receivePlayerList', src, playerList)
            
        else
            -- Sicherheitsfehler: Identifier stimmt nicht überein
            DropPlayer(src, 'Sicherheitsfehler: Der Team-Name ist nicht mit dieser ID verknüpft. Kontaktiere die Projektleitung.')
        end
    end)
end)

-- #################################################
-- 2. ADMIN AKTIONEN (NUI -> SERVER)
-- #################################################

RegisterNetEvent('nordstadt:executeAction')
AddEventHandler('nordstadt:executeAction', function(data)
    local adminSrc = source
    local targetId = data.targetId
    local action = data.action
    local reason = data.reason or 'Kein Grund angegeben.'

    local adminRank = GetPlayerVariable(adminSrc, 'adminRank')

    -- Sicherheitscheck: Ist der Spieler überhaupt als Teamler eingeloggt?
    if not adminRank or adminRank < 1 then 
        DropPlayer(adminSrc, 'Fehler: Du bist nicht berechtigt oder nicht eingeloggt.')
        return
    end

    local adminName = GetPlayerName(adminSrc) 
    local targetName = GetPlayerName(targetId)

    if action == 'kick' then
        if targetId ~= adminSrc then
            DropPlayer(targetId, reason)
            AddAdminLog(adminName, targetName, 'Kick', reason) -- Log-Eintrag
        end
    
    elseif action == 'ban' then
        if targetId ~= adminSrc then
            -- HIER: Rufe deine Ban-Funktion auf, die in die DB schreibt
            print(`[MODPANEL] ${adminName} bannte ${targetName} | Grund: ${reason}`)
            AddAdminLog(adminName, targetName, 'Ban', reason) -- Log-Eintrag
        end

    elseif action == 'revive' then
        -- TriggerClientEvent('esx:revive', targetId) -- Beispiel ESX
        print(`[MODPANEL] ${adminName} belebte ${targetName} wieder.`)
        AddAdminLog(adminName, targetName, 'Revive', 'Selbstheilung durch Admin-Aktion') -- Log-Eintrag
    
    end
end)

-- #################################################
-- 3. LOG-ABRUF (NUI -> SERVER)
-- #################################################

RegisterNetEvent('nordstadt:requestLogs')
AddEventHandler('nordstadt:requestLogs', function()
    local src = source
    
    -- Sende die gesamte Log-Liste an den anfragenden Admin-Client
    TriggerClientEvent('nordstadt:receiveAdminLogs', src, AdminLogs)
end)