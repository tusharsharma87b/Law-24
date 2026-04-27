@echo off
set LOG=C:\Users\mohit\OneDrive\Documents\GitHub\Law-24\debug-a08cc0.log
echo {"sessionId":"a08cc0","runId":"cmd-run","hypothesisId":"H8_H9_H10","location":"collect-terminal-evidence.cmd","message":"Live terminal snapshot start","timestamp":0}>>"%LOG%"
echo ===== where npm =====>>"%LOG%"
where npm >>"%LOG%" 2>&1
echo ===== where npx =====>>"%LOG%"
where npx >>"%LOG%" 2>&1
echo ===== npm -v =====>>"%LOG%"
npm -v >>"%LOG%" 2>&1
echo ===== npx -v =====>>"%LOG%"
npx -v >>"%LOG%" 2>&1
echo ===== PATH =====>>"%LOG%"
echo %PATH%>>"%LOG%"
echo Evidence captured in %LOG%
