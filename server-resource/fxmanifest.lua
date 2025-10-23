fx_version 'cerulean'
games { 'gta5' }

author 'Dein Name / Nordstadt RP Team'
description 'Erweitertes Teamler Modpanel mit sicherem Login (Vercel/DB)'
version '1.0.0'

-- Die NUI-Seite wird von der Konfiguration geladen
ui_page Config.NuiUrl

-- Dateipfade für den FiveM Client (müssen vom Browser/NUI geladen werden)
-- Diese Pfade werden nur benötigt, wenn du NICHT den Vercel Link nutzt!
-- Wenn du den Vercel Link (Config.NuiUrl) nutzt, kannst du die files {} Sektion weglassen
-- files {
--     'web-ui/build/index.html',
--     'web-ui/build/static/css/*.css',
--     'web-ui/build/static/js/*.js',
--     'web-ui/build/assets/*',
-- }

-- Server Skripte
server_scripts {
    '@mysql-async/lib/MySQL.lua', -- DEIN DB-WRAPPER
    'config.lua',
    'server/server.lua'
}

-- Client Skripte
client_scripts {
    'config.lua',
    'client/client.lua'
}

-- Befehle, um das Panel zu öffnen
command 'modpanel'