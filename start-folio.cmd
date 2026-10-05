@echo off
title Folio dev server
cd /d "%~dp0"
echo.
echo   Folio - starting dev server
echo   URL: http://127.0.0.1:5173/
echo   Close this window to stop the server.
echo.
start "" http://127.0.0.1:5173/
call npm run dev -- --host 127.0.0.1 --port 5173
