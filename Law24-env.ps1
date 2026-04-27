# Dot-source this so PowerShell recognizes `nxp` (same typo as many users type).
# Usage from Law-24 folder:
#   . .\Law24-env.ps1
# Then:
#   nxp expo go
#
$repo = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$env:PATH = "$repo;$env:PATH"

function nxp {
    $shim = Join-Path $repo 'nxp.cmd'
    & $shim @args
}

Write-Host "Law24 ready. Run:  nxp expo go" -ForegroundColor Green
Write-Host "Or without this file, PowerShell needs an explicit path:  .\nxp.cmd expo go" -ForegroundColor DarkGray
