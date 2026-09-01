# Shutterdesk fresh-user API verification (empty database)
# Prerequisite: npm run db:reset:clean && npm run dev:all
# Usage: powershell -File scripts/verify-fresh-user-api.ps1

$ErrorActionPreference = "Stop"
$base = if ($env:VITE_API_URL) { $env:VITE_API_URL } else { "http://localhost:5000/api" }
$password = "TestPass123!"
$passed = 0
$failed = 0

function Assert($name, $condition) {
  if ($condition) {
    Write-Host "[PASS] $name" -ForegroundColor Green
    $script:passed++
  } else {
    Write-Host "[FAIL] $name" -ForegroundColor Red
    $script:failed++
  }
}

function Register($email, $fullName, $phone) {
  $body = @{
    fullName = $fullName
    email = $email
    phone = $phone
    password = $password
  } | ConvertTo-Json
  return Invoke-RestMethod -Uri "$base/auth/register" -Method POST -ContentType "application/json" -Body $body
}

function SetRole($token, $role) {
  $headers = @{ Authorization = "Bearer $token" }
  return Invoke-RestMethod -Uri "$base/auth/me/role" -Method PATCH -Headers $headers -ContentType "application/json" -Body (@{ role = $role } | ConvertTo-Json)
}

Write-Host "`nShutterdesk fresh-user API verification -> $base`n" -ForegroundColor Cyan

try {
  $health = Invoke-RestMethod -Uri "$base/health"
  Assert "Health endpoint" ($health.status -eq "ok")
} catch {
  Assert "Health endpoint" $false
  Write-Host "Server not reachable. Start with: npm run dev:all" -ForegroundColor Yellow
  exit 1
}

$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$photoEmail = "amara.mukamana+$stamp@shutterdesk.rw"
$photoBEmail = "jean.baptiste+$stamp@shutterdesk.rw"
$clientEmail = "claudine.uwase+$stamp@gmail.com"

# Photographer A
$photoA = Register $photoEmail "Amara Mukamana" "+250 788 100 101"
Assert "Photographer A register" ($photoA.token.Length -gt 10)

$photoARole = SetRole $photoA.token "photographer"
$hpA = @{ Authorization = "Bearer $($photoARole.token)" }

$onboardA = Invoke-RestMethod -Uri "$base/photographer/onboarding/complete" -Method POST -Headers $hpA -ContentType "application/json" -Body (@{
    businessName = "Amara Mukamana Photography"
    specialization = "Wedding"
    bio = "Wedding and portrait photographer based in Kigali."
    momoAccountName = "Amara Mukamana Photography"
    momoNumber = "+250 788 100 101"
  } | ConvertTo-Json)

Assert "Photographer A studio created" ($onboardA.data.studio.slug.Length -gt 3)

$dashA = Invoke-RestMethod -Uri "$base/photographer/dashboard" -Headers $hpA
Assert "Photographer A dashboard" ($null -ne $dashA.data)

$pkgA = Invoke-RestMethod -Uri "$base/photographer/services" -Method POST -Headers $hpA -ContentType "application/json" -Body (@{
    title = "Wedding Essentials"
    description = "Full-day wedding coverage with edited gallery."
    price = 450000
    category = "wedding"
    duration = "8hr"
    isActive = $true
  } | ConvertTo-Json)

Assert "Photographer A package created" ($pkgA.data.id.Length -gt 3)

# Photographer B
$photoB = Register $photoBEmail "Jean Baptiste Nkurunziza" "+250 788 200 202"
$photoBRole = SetRole $photoB.token "photographer"
$hpB = @{ Authorization = "Bearer $($photoBRole.token)" }

$onboardB = Invoke-RestMethod -Uri "$base/photographer/onboarding/skip" -Method POST -Headers $hpB
Assert "Photographer B skip onboarding" ($onboardB.data.studio.slug.Length -gt 3)

$pkgB = Invoke-RestMethod -Uri "$base/photographer/services" -Method POST -Headers $hpB -ContentType "application/json" -Body (@{
    title = "Portrait Session"
    description = "Studio portrait session with 20 edits."
    price = 120000
    category = "portrait"
    duration = "2hr"
    isActive = $true
  } | ConvertTo-Json)

Assert "Photographer B package created" ($pkgB.data.id.Length -gt 3)

# Client
$client = Register $clientEmail "Claudine Uwase" "+250 788 300 303"
$clientRole = SetRole $client.token "client"
$hc = @{ Authorization = "Bearer $($clientRole.token)" }

$settings = Invoke-RestMethod -Uri "$base/client/settings" -Method PATCH -Headers $hc -ContentType "application/json" -Body (@{
    phone = "+250 788 300 303"
    address = "Kigali, Rwanda"
    interests = @("Wedding", "Portrait")
  } | ConvertTo-Json)

Assert "Client onboarding settings" ($settings.data.phone -match "\+250")

$studios = Invoke-RestMethod -Uri "$base/client/studios" -Headers $hc
Assert "Client sees marketplace studios" ($studios.data.Count -ge 2)

$studioASlug = $onboardA.data.studio.slug
$studioBSlug = $onboardB.data.studio.slug

$servicesA = Invoke-RestMethod -Uri "$base/client/studios/$studioASlug/services" -Headers $hc
$servicesB = Invoke-RestMethod -Uri "$base/client/studios/$studioBSlug/services" -Headers $hc

Assert "Studio A public services" ($servicesA.data.Count -ge 1)
Assert "Studio B public services" ($servicesB.data.Count -ge 1)

$bookingA = Invoke-RestMethod -Uri "$base/client/bookings" -Method POST -Headers $hc -ContentType "application/json" -Body (@{
    servicePackageId = $servicesA.data[0].id
    date = "Jul 20, 2026"
    time = "10:30 AM"
    locationNotes = "Kigali, Rwanda"
  } | ConvertTo-Json)

$bookingB = Invoke-RestMethod -Uri "$base/client/bookings" -Method POST -Headers $hc -ContentType "application/json" -Body (@{
    servicePackageId = $servicesB.data[0].id
    date = "Jul 22, 2026"
    time = "02:00 PM"
    locationNotes = "Kigali, Rwanda"
  } | ConvertTo-Json)

$clientBookings = Invoke-RestMethod -Uri "$base/client/bookings" -Headers $hc
$hasA = $clientBookings.data | Where-Object { $_.id -eq $bookingA.data.id }
$hasB = $clientBookings.data | Where-Object { $_.id -eq $bookingB.data.id }

Assert "Client booking studio A" ($null -ne $hasA)
Assert "Client booking studio B" ($null -ne $hasB)

$clientNotifs = Invoke-RestMethod -Uri "$base/client/notifications" -Headers $hc
Assert "Client notifications after bookings" ($clientNotifs.data.Count -ge 1)

Write-Host "`nFresh-user verification: $passed passed, $failed failed`n" -ForegroundColor Cyan
if ($failed -gt 0) { exit 1 }
