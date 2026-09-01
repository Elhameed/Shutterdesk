# Shutterdesk local API verification (Phases 0–7)
# Usage: powershell -File scripts/verify-local-api.ps1

$ErrorActionPreference = "Stop"
$base = if ($env:VITE_API_URL) { $env:VITE_API_URL } else { "http://localhost:5000/api" }
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

function Login($email) {
  $body = @{ email = $email; password = "password123" } | ConvertTo-Json
  return Invoke-RestMethod -Uri "$base/auth/login" -Method POST -ContentType "application/json" -Body $body
}

Write-Host "`nShutterdesk local API verification -> $base`n" -ForegroundColor Cyan

try {
  $health = Invoke-RestMethod -Uri "$base/health"
  Assert "Health endpoint" ($health.status -eq "ok")
} catch {
  Assert "Health endpoint" $false
  Write-Host "Server not reachable. Start with: npm run dev:all" -ForegroundColor Yellow
  exit 1
}

$p = Login "imani.uwase@shutterdesk.rw"
$c = Login "immaculee.niyonsaba@gmail.com"
$hp = @{ Authorization = "Bearer $($p.token)" }
$hc = @{ Authorization = "Bearer $($c.token)" }

Assert "Photographer login" ($p.token.Length -gt 10)
Assert "Client login" ($c.token.Length -gt 10)

# Photographer domains
$clients = Invoke-RestMethod -Uri "$base/photographer/clients" -Headers $hp
$bookings = Invoke-RestMethod -Uri "$base/photographer/bookings" -Headers $hp
$galleries = Invoke-RestMethod -Uri "$base/photographer/galleries" -Headers $hp
$services = Invoke-RestMethod -Uri "$base/photographer/services" -Headers $hp
$verifs = Invoke-RestMethod -Uri "$base/photographer/payments/verifications" -Headers $hp
$calendar = Invoke-RestMethod -Uri "$base/photographer/calendar?month=6&year=2026" -Headers $hp
$dashboard = Invoke-RestMethod -Uri "$base/photographer/dashboard" -Headers $hp
$analytics = Invoke-RestMethod -Uri "$base/photographer/analytics" -Headers $hp
$pNotifs = Invoke-RestMethod -Uri "$base/photographer/notifications" -Headers $hp
$pProfile = Invoke-RestMethod -Uri "$base/photographer/settings/profile" -Headers $hp

Assert "Photographer clients" ($clients.data.Count -ge 1)
Assert "Photographer bookings" ($bookings.data.Count -ge 1)
Assert "Photographer galleries" ($galleries.data.Count -ge 1)
Assert "Photographer services" ($services.data.Count -ge 1)
Assert "Payment verifications" ($null -ne $verifs.data)
Assert "Calendar month data" ($null -ne $calendar.data)
Assert "Dashboard summary" ($null -ne $dashboard.data)
Assert "Analytics summary" ($null -ne $analytics.data)
Assert "Photographer notifications" ($pNotifs.data.Count -ge 1)
Assert "Settings profile" ($pProfile.data.fullName -eq "Imani Uwase")

# Client domains
$cBookings = Invoke-RestMethod -Uri "$base/client/bookings" -Headers $hc
$cGalleries = Invoke-RestMethod -Uri "$base/client/galleries" -Headers $hc
$cPayments = Invoke-RestMethod -Uri "$base/client/payments" -Headers $hc
$cRequests = Invoke-RestMethod -Uri "$base/client/payments/requests" -Headers $hc
$cOutstanding = Invoke-RestMethod -Uri "$base/client/payments/outstanding" -Headers $hc
$cDashboard = Invoke-RestMethod -Uri "$base/client/dashboard" -Headers $hc
$cServices = Invoke-RestMethod -Uri "$base/client/services" -Headers $hc
$cStudios = Invoke-RestMethod -Uri "$base/client/studios" -Headers $hc
$cNotifs = Invoke-RestMethod -Uri "$base/client/notifications" -Headers $hc
$cSettings = Invoke-RestMethod -Uri "$base/client/settings" -Headers $hc
$momo = Invoke-RestMethod -Uri "$base/client/payments/studios/imani-uwase-photography/profile" -Headers $hc

Assert "Client bookings" ($cBookings.data.Count -ge 1)
Assert "Client galleries" ($cGalleries.data.Count -ge 1)
Assert "Client payment history" ($null -ne $cPayments.data)
Assert "Client payment requests" ($cRequests.data.Count -ge 1)
Assert "Client outstanding balance" ($cOutstanding.data.totalBalance -ge 0)
Assert "Client dashboard" ($null -ne $cDashboard.data)
Assert "Public services" ($cServices.data.Count -ge 1)
Assert "Client studios (marketplace)" ($cStudios.data.Count -ge 2)
Assert "Client notifications" ($cNotifs.data.Count -ge 1)
Assert "Client settings" ($cSettings.data.phone -match "\+250")
Assert "Studio MoMo profile by slug" ($momo.data.merchantCode.Length -ge 1)

# Marketplace booking: create 2 bookings, one per studio
try {
  $studioA = $cStudios.data[0].slug
  $studioB = $cStudios.data[1].slug

  $servicesA = Invoke-RestMethod -Uri "$base/client/studios/$studioA/services" -Headers $hc
  $servicesB = Invoke-RestMethod -Uri "$base/client/studios/$studioB/services" -Headers $hc

  Assert "Studio A services" ($servicesA.data.Count -ge 1)
  Assert "Studio B services" ($servicesB.data.Count -ge 1)

  $pkgA = $servicesA.data[0].id
  $pkgB = $servicesB.data[0].id

  $b1 = Invoke-RestMethod -Uri "$base/client/bookings" -Method POST -Headers $hc -ContentType "application/json" -Body (@{
      servicePackageId = $pkgA
      date = "Jul 20, 2026"
      time = "10:30 AM"
      locationNotes = "Kigali, Rwanda"
    } | ConvertTo-Json)

  $b2 = Invoke-RestMethod -Uri "$base/client/bookings" -Method POST -Headers $hc -ContentType "application/json" -Body (@{
      servicePackageId = $pkgB
      date = "Jul 22, 2026"
      time = "02:00 PM"
      locationNotes = "Kigali, Rwanda"
    } | ConvertTo-Json)

  $afterBookings = Invoke-RestMethod -Uri "$base/client/bookings" -Headers $hc
  $hasB1 = $afterBookings.data | Where-Object { $_.id -eq $b1.data.id }
  $hasB2 = $afterBookings.data | Where-Object { $_.id -eq $b2.data.id }
  Assert "Marketplace booking A created" ($null -ne $hasB1)
  Assert "Marketplace booking B created" ($null -ne $hasB2)
} catch {
  Assert "Marketplace booking flow" $false
}

# Booking detail
if ($cBookings.data.Count -gt 0) {
  $bid = $cBookings.data[0].id
  $detail = Invoke-RestMethod -Uri "$base/client/bookings/$bid" -Headers $hc
  Assert "Client booking detail" ($detail.data.id -eq $bid)
}

# Gallery detail
if ($cGalleries.data.Count -gt 0) {
  $gid = $cGalleries.data[0].id
  $gDetail = Invoke-RestMethod -Uri "$base/client/galleries/$gid" -Headers $hc
  Assert "Client gallery detail" ($gDetail.data.gallery.id -eq $gid)
}

# Mark notification read persists
$unread = $cNotifs.data | Where-Object { -not $_.read } | Select-Object -First 1
if ($unread) {
  Invoke-RestMethod -Uri "$base/client/notifications/$($unread.id)/read" -Method PATCH -Headers $hc | Out-Null
  $after = Invoke-RestMethod -Uri "$base/client/notifications" -Headers $hc
  $marked = $after.data | Where-Object { $_.id -eq $unread.id -and $_.read }
  Assert "Mark notification read persists" ($null -ne $marked)
}

Write-Host "`nResults: $passed passed, $failed failed`n" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
if ($failed -gt 0) { exit 1 }
