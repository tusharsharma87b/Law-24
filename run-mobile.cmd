@echo off
setlocal
set ROOT=C:\Users\mohit\OneDrive\Documents\GitHub\Law-24
set MOBILE=%ROOT%\Mobile
set NODEJS=C:\Program Files\nodejs
set LOG=%ROOT%\debug-a08cc0.log

echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H11","location":"run-mobile.cmd","message":"Project launcher started","data":{"mobile":"%MOBILE%","nodejs":"%NODEJS%"},"timestamp":0}>>"%LOG%"

if not exist "%NODEJS%\npm.cmd" (
  echo Node.js npm.cmd not found at "%NODEJS%\npm.cmd"
  echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H11","location":"run-mobile.cmd","message":"npm.cmd missing","data":{"path":"%NODEJS%\npm.cmd"},"timestamp":0}>>"%LOG%"
  exit /b 1
)

cd /d "%MOBILE%"
call "%NODEJS%\npm.cmd" install
if errorlevel 1 (
  echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H11","location":"run-mobile.cmd","message":"npm install failed","data":{},"timestamp":0}>>"%LOG%"
  exit /b 1
)
for /f %%p in ('powershell -NoProfile -Command "$l=[System.Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0);$l.Start();$p=$l.LocalEndpoint.Port;$l.Stop();Write-Output $p"') do set EXPO_PORT=%%p
echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H27","location":"run-mobile.cmd","message":"Starting Expo in tunnel mode for cross-network mobile access","data":{"port":"%EXPO_PORT%","host":"tunnel"},"timestamp":0}>>"%LOG%"
echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H24","location":"run-mobile.cmd","message":"LAN IP detection removed due command parser incompatibility","data":{"port":"%EXPO_PORT%"},"timestamp":0}>>"%LOG%"
echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H19","location":"run-mobile.cmd","message":"Forcing Expo Go client mode","data":{"mode":"go"},"timestamp":0}>>"%LOG%"
echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H22","location":"run-mobile.cmd","message":"Clearing Metro cache for mobile load reliability","data":{"clear":true},"timestamp":0}>>"%LOG%"
echo Scan the QR code below with Expo Go to open Law-24 on mobile.
call "%NODEJS%\npx.cmd" expo start --go --clear --host tunnel --port %EXPO_PORT%
if errorlevel 1 (
  echo {"sessionId":"a08cc0","runId":"run-mobile-cmd","hypothesisId":"H18","location":"run-mobile.cmd","message":"Tunnel failed, falling back to LAN mode","data":{"port":"%EXPO_PORT%","host":"lan"},"timestamp":0}>>"%LOG%"
  call "%NODEJS%\npx.cmd" expo start --go --clear --host lan --port %EXPO_PORT%
)
