-- /nordstadt-modpanel/fxmanifest.lua

fx_version 'cerulean'
game 'gta5'

-- Resource-Informationen
name 'Nordstadt RP Modpanel'
description 'Einfaches Admin Panel (NUI)'
author 'Dein Name'
version '1.0.0'

-- Web-UI Dateien (MUSS im Ordner 'web-ui' liegen)
ui_page 'web-ui/index.html'

files {
    'web-ui/index.html',
    'web-ui/index.css'
    -- Füge hier weitere Assets (Bilder, etc.) hinzu, falls nötig
}

-- Client-Skripte
client_scripts {
    'client.lua'
}

-- Server-Skripte
server_scripts {
    '@oxmysql/lib/MySQL.lua', -- Wenn du oxmysql verwendest
    'server.lua'
    -- 'db.lua' -- Wenn du eine separate DB-Datei verwendest
}

-- Tastenbelegung (Beispiel: F9)
-- Damit Admins das Panel öffnen können
bind 'keyboard' 'F9' '+openmodpanel'
command '+openmodpanel' 'Admin Panel öffnen'
command '-openmodpanel' 'Admin Panel schließen'