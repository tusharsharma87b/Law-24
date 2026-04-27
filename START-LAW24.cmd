@echo off
title Law24 - Start for Expo Go
cd /d "%~dp0"

REM So typing "nxp" in THIS cmd window finds nxp.cmd in this folder
set "PATH=%~dp0;%PATH%"

echo.
echo  ============================================================
echo   LAW 24 - Start development server (Expo Go + Web)
echo  ============================================================
echo.
echo   In THIS cmd window you can run:  nxp expo go
echo   PowerShell (pick one^):
echo     One-time: powershell -ExecutionPolicy Bypass -File .\INSTALL-PS-NXP-ALIAS.ps1
echo     (Cursor uses a different PS profile — this covers it^)
echo     then in NEW terminal:  nxp expo go
echo     or:  .\nxp.cmd expo go
echo     or:  . .\Law24-env.ps1   then   nxp expo go
echo     or double-click:  OPEN-LAW24.cmd
echo.
echo   Below, run-mobile starts Expo and shows QR + web link.
echo  ============================================================
echo.

call "%~dp0run-mobile.cmd"

pause
