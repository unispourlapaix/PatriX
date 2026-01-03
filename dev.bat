@echo off
echo 🚀 Demarrage du serveur de developpement - Patri-X...
echo.

REM Tuer les processus Python existants sur le port 8000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a 2>nul

echo 📍 URL: http://localhost:8000
echo 💡 Service Worker actif uniquement sur HTTPS ou localhost
echo 🎨 Design: moderne Sf - Mobile HD Portrait
echo.

REM Démarrer le serveur Python
cd /d "%~dp0"
python -m http.server 8000

pause

