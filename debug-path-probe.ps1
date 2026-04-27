$logPath = "C:\Users\mohit\OneDrive\Documents\GitHub\Law-24\debug-a08cc0.log"
$runId = "run-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$nodePath = "C:\Program Files\nodejs"

function Write-DebugLog([string]$hypothesisId, [string]$location, [string]$message, $data) {
    $payload = @{
        sessionId = "a08cc0"
        runId = $runId
        hypothesisId = $hypothesisId
        location = $location
        message = $message
        data = $data
        timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    } | ConvertTo-Json -Compress -Depth 5
    Add-Content -Path $logPath -Value $payload
}

#region agent log
Write-DebugLog "H1" "debug-path-probe.ps1:19" "PowerShell startup context" @{
    psEdition = $PSVersionTable.PSEdition
    psVersion = $PSVersionTable.PSVersion.ToString()
    profilePath = $PROFILE
    executionPolicyProcess = (Get-ExecutionPolicy -Scope Process)
    executionPolicyCurrentUser = (Get-ExecutionPolicy -Scope CurrentUser)
}
#endregion

#region agent log
$effectivePathHasNode = (($env:Path -split ";") -contains $nodePath)
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$userPathHasNode = (($userPath -split ";") -contains $nodePath)
Write-DebugLog "H2" "debug-path-probe.ps1:33" "PATH checks for nodejs" @{
    effectivePathHasNode = $effectivePathHasNode
    userPathHasNode = $userPathHasNode
}
#endregion

#region agent log
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
$npxCmd = Get-Command npx -ErrorAction SilentlyContinue
Write-DebugLog "H3" "debug-path-probe.ps1:43" "Command resolution results" @{
    node = $(if ($nodeCmd) { $nodeCmd.Source } else { "missing" })
    npm = $(if ($npmCmd) { $npmCmd.Source } else { "missing" })
    npx = $(if ($npxCmd) { $npxCmd.Source } else { "missing" })
}
#endregion

#region agent log
Write-DebugLog "H4" "debug-path-probe.ps1:52" "Node installation directory contents check" @{
    nodeFolderExists = (Test-Path $nodePath)
    npmCmdExists = (Test-Path "C:\Program Files\nodejs\npm.cmd")
    npxCmdExists = (Test-Path "C:\Program Files\nodejs\npx.cmd")
}
#endregion

#region agent log
Write-DebugLog "H7" "debug-path-probe.ps1:61" "WindowsApps shim availability check" @{
    windowsAppsPathInEffectivePath = (($env:Path -split ";") -contains "C:\Users\mohit\AppData\Local\Microsoft\WindowsApps")
    npmShimExists = (Test-Path "C:\Users\mohit\AppData\Local\Microsoft\WindowsApps\npm.cmd")
    npxShimExists = (Test-Path "C:\Users\mohit\AppData\Local\Microsoft\WindowsApps\npx.cmd")
}
#endregion

Write-Output "Probe complete. Log written to debug-a08cc0.log"
