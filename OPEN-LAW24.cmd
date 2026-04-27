@echo off
cd /d "%~dp0"
title Law24 - OPEN-LAW24
echo Starting Expo (Expo Go). QR and http://localhost link appear below.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0OPEN-LAW24.ps1"
if errorlevel 1 pause
