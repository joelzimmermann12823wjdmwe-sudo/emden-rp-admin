-- /nordstadt-modpanel/db.lua

-- Dieses Skript ist primär eine Notiz, da Datenbank-Hooks stark vom Framework abhängen.
-- ERSETZE DIES DURCH DEINE ECHTEN DB-FUNKTIONEN!

local MySQL = exports['oxmysql'] -- Beispiel für oxmysql

-- Beispiel: Eine Funktion zum Speichern einer Verwarnung in der Datenbank
function LogWarning(adminName, targetRobloxId, targetName)
    local query = [[
        INSERT INTO modpanel_warnings (admin_name, target_id, target_name, timestamp)
        VALUES (@adminName, @targetId, @targetName, NOW())
    ]]
    
    MySQL.update(query, {
        ['@adminName'] = adminName,
        ['@targetId'] = targetRobloxId,
        ['@targetName'] = targetName
    }, function(rowsAffected)
        -- Callback, falls benötigt
    end)
end

-- Datenbanktabelle für Verwarnungen (Muss einmal in MySQL ausgeführt werden)
/*
CREATE TABLE IF NOT EXISTS `modpanel_warnings` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `admin_name` VARCHAR(50) NOT NULL,
    `target_id` VARCHAR(50) NOT NULL, 
    `target_name` VARCHAR(50) NOT NULL,
    `timestamp` DATETIME NOT NULL,
    PRIMARY KEY (`id`)
);
*/

-- Andere DB-Funktionen (Ban, Admin-Prüfung, etc.) würden hier eingefügt.