@echo off
setlocal EnableExtensions
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "NODEJS=C:\Program Files\nodejs"
set "LOG=%ROOT%\debug-a08cc0.log"
set "MOBILE=%ROOT%\Mobile"

REM #region agent log
>>"%LOG%" echo {"sessionId":"a08cc0","hypothesisId":"H-shim","location":"nxp.cmd","message":"nxp shim invoked","data":{"rawArgs":"%*"},"timestamp":0}
REM #endregion

if not exist "%NODEJS%\npx.cmd" (
  echo ERROR: Node.js not found at "%NODEJS%\npx.cmd"
  exit /b 1
)

REM Map common mistake: "expo go" to the hardened launcher path
if /i "%~1"=="expo" if /i "%~2"=="go" (
  REM #region agent log
  >>"%LOG%" echo {"sessionId":"a08cc0","hypothesisId":"H32","location":"nxp.cmd","message":"Routing expo go through run-mobile.cmd for stable Expo Go behavior","data":{},"timestamp":0}
  REM #endregion
  cd /d "%ROOT%"
  call "%ROOT%\run-mobile.cmd"
  exit /b %ERRORLEVEL%
)

call "%NODEJS%\npx.cmd" %*
exit /b %ERRORLEVEL%
