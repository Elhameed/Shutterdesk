# Shutterdesk — reset to a completely empty database for first-time user testing.
#
# Usage (from repo root):
#   npm run db:reset:clean
#
# After reset, clear browser localStorage (or use incognito):
#   - shutterdesk_token, shutterdesk_role, shutterdesk_remember
#   - shutterdesk_onboarding_complete, shutterdesk_selected_role (legacy mock keys)
#
# Then restart the dev stack:
#   npm run dev:all

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$serverDir = Join-Path $repoRoot "server"

Write-Host "`nShutterdesk fresh environment reset`n" -ForegroundColor Cyan

# Release port 5000 so Prisma can regenerate the query engine on Windows.
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique
if ($port5000) {
  Write-Host "Stopping process on port 5000 (PID $port5000)..." -ForegroundColor Yellow
  $port5000 | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 2
}

Push-Location $serverDir
try {
  Write-Host "Resetting database (migrations only, no seed)..." -ForegroundColor Cyan
  npx prisma migrate reset --force --skip-seed
  Write-Host "Regenerating Prisma client..." -ForegroundColor Cyan
  npx prisma generate
} finally {
  Pop-Location
}

Write-Host "`nDatabase is empty. Start the app with: npm run dev:all" -ForegroundColor Green
Write-Host "Use separate browser profiles for photographer vs client testing.`n" -ForegroundColor Green
