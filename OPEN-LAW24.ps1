# One-command start: loads the nxp shim and runs Expo (same as nxp expo go).
# From Law-24 folder, double-click OPEN-LAW24.cmd, or:
#   powershell -ExecutionPolicy Bypass -File .\OPEN-LAW24.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
. (Join-Path $PSScriptRoot 'Law24-env.ps1')
nxp expo go
