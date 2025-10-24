-- ===============================================
-- NORDSTADT RP ADMIN PANEL - DATENBANKSTRUKTUR
--
-- Diese Datei muss einmalig in die MySQL-Datenbank
-- importiert werden, die dein FiveM Server nutzt.
-- ===============================================

-- -----------------------------------------------------
-- Tabelle für ADMIN VERWARNUNGEN (Logt jede Warnung)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `modpanel_warnings` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    
    -- Admin, der die Warnung ausgesprochen hat
    `admin_name` VARCHAR(50) NOT NULL,
    `admin_source_id` INT(11) NOT NULL, -- Server ID des Admins
    
    -- Zielspieler
    `target_name` VARCHAR(50) NOT NULL,
    `target_roblox_id` VARCHAR(50) NOT NULL, -- Dient als dauerhafter Identifier
    
    -- Details zur Warnung
    `reason` TEXT NULL, -- Grund der Warnung
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- -----------------------------------------------------
-- Tabelle für ADMIN BANS (Logt dauerhafte oder temporäre Bans)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `modpanel_bans` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    
    -- Admin, der den Ban ausgesprochen hat
    `admin_name` VARCHAR(50) NOT NULL,
    
    -- Zielspieler (Die Identifier sind wichtig für das Ban-System)
    `target_name` VARCHAR(50) NOT NULL,
    `target_roblox_id` VARCHAR(50) NOT NULL, 
    `target_license` VARCHAR(50) NULL, -- Optional: license:Identifier
    
    -- Details zum Ban
    `reason` TEXT NOT NULL,
    `start_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `end_time` DATETIME NULL, -- NULL für permanenten Ban
    `is_active` BOOLEAN NOT NULL DEFAULT 1,
    
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- -----------------------------------------------------
-- Tabelle für ALLGEMEINE ADMIN LOGS (Wer hat was gemacht)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `modpanel_admin_logs` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    
    `admin_name` VARCHAR(50) NOT NULL,
    `admin_source_id` INT(11) NOT NULL,
    
    -- Aktion (z.B. 'BAN', 'WARN', 'KICK', 'TELEPORT')
    `action` VARCHAR(30) NOT NULL,
    
    -- Betroffenes Ziel (falls vorhanden)
    `target_name` VARCHAR(50) NULL,
    `target_id` INT(11) NULL, -- Server ID des Ziels (wenn online)

    -- Allgemeine Beschreibung / Daten
    `details` TEXT NULL, 
    `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;