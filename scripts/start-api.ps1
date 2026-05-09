$existingApiProcess = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty OwningProcess

if ($existingApiProcess) {
  Write-Host "Stopping existing API process on :4000 (PID: $existingApiProcess)"
  Stop-Process -Id $existingApiProcess -Force -ErrorAction SilentlyContinue
  Start-Sleep -Milliseconds 500
}

npm --prefix "./Mobile/apps/api" run dev
