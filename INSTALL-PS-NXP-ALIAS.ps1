# One-time: register global "nxp" in PowerShell so you can type: nxp expo go
# (without .\ ) from any directory after opening a NEW terminal.
# Writes to BOTH host profiles: standalone PowerShell AND Cursor/VS Code terminal.
# Run:  powershell -ExecutionPolicy Bypass -File .\INSTALL-PS-NXP-ALIAS.ps1
# Uninstall: remove the "#region Law24-nxp" block from the profile file(s) shown.

$ErrorActionPreference = 'Stop'
$shim = Join-Path $PSScriptRoot 'nxp.cmd'
if (-not (Test-Path -LiteralPath $shim)) {
    throw "nxp.cmd not found at: $shim"
}

$shimEsc = $shim -replace "'", "''"
$reg = @"
#region Law24-nxp
function nxp { & '$shimEsc' @args }
#endregion Law24-nxp

"@

$log = Join-Path $PSScriptRoot 'debug-a08cc0.log'
# Use same Documents folder as Windows (OneDrive-redirected or not)
$base = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'WindowsPowerShell'
$targets = @(
    (Join-Path $base 'Microsoft.PowerShell_profile.ps1'),
    (Join-Path $base 'Microsoft.VSCode_profile.ps1')
)

if (-not (Test-Path -LiteralPath $base)) {
    New-Item -ItemType Directory -Path $base -Force | Out-Null
}

$written = [System.Collections.Generic.List[string]]::new()
foreach ($path in $targets) {
    if (Test-Path -LiteralPath $path) {
        $raw = Get-Content -LiteralPath $path -Raw
        if ($raw -match 'Law24-nxp') {
            $written.Add("$path (already had nxp block)")
            continue
        }
        Add-Content -LiteralPath $path -Value "`n$reg" -Encoding utf8
    } else {
        Set-Content -LiteralPath $path -Value $reg -Encoding utf8
    }
    $written.Add($path)
}

$payload = [ordered]@{
    sessionId    = 'a08cc0'
    hypothesisId = 'H-CursorHost'
    location     = 'INSTALL-PS-NXP-ALIAS.ps1'
    message      = 'Install nxp into PS + VSCode host profiles'
    data         = @{ targets = $written; shim = $shim }
    timestamp    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
} | ConvertTo-Json -Compress
Add-Content -LiteralPath $log -Value $payload

Write-Host "nxp function installed. Close and reopen the terminal, then: nxp expo go" -ForegroundColor Green
foreach ($w in $written) { Write-Host "  $w" -ForegroundColor DarkGray }
