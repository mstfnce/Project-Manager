# Projeyi gelistirme modunda ayaga kaldirir.
#   Kullanim:  .\start.ps1
#
# Veritabani container'i, frontend ve backend ayri pencerelerde calisir.
# Docker'i imaj olarak kullanmiyoruz - gelistirme sirasinda hot reload
# lazim, o yuzden backend ve frontend host makinede kosuyor (bkz. ROADMAP
# Bolum 11: Docker paketleme asamasi icin, gelistirme icin degil).

$ErrorActionPreference = 'Stop'

# Script nerede duruyorsa proje kokunu oradan buluyoruz - boylece scripti
# hangi klasorden cagirirsan cagir dogru yerde calisiyor.
$root = $PSScriptRoot

Write-Host ''
Write-Host '=== Proje Takip - gelistirme ortami ===' -ForegroundColor Cyan
Write-Host ''

# --- 1) Veritabani -----------------------------------------------------
# Container'in restart politikasi "unless-stopped", yani Docker Desktop
# acilinca kendiliginden kalkiyor. Buradaki kontrol bir emniyet kemeri:
# yanlislikla "docker compose down" dendiyse sessizce geri kaldirir.
Write-Host '[1/3] Veritabani kontrol ediliyor...' -ForegroundColor Yellow

$dbRunning = docker ps --filter 'name=projectmanager-db' --filter 'status=running' --format '{{.Names}}'

if ($dbRunning) {
    Write-Host '      Zaten calisiyor (projectmanager-db).' -ForegroundColor Green
}
else {
    Write-Host '      Kapali, baslatiliyor...'
    docker compose -f "$root\docker-compose.yml" up -d db
    if ($LASTEXITCODE -ne 0) {
        Write-Host '      HATA: veritabani baslatilamadi. Docker Desktop acik mi?' -ForegroundColor Red
        exit 1
    }
    Write-Host '      Baslatildi.' -ForegroundColor Green
}

# --- 2) Backend --------------------------------------------------------
# "dotnet watch run": bir .cs dosyasini kaydettiginde API'yi kendiliginden
# yeniden baslatir, elle durdurup baslatmaya gerek kalmaz.
Write-Host '[2/3] Backend aciliyor (http://localhost:5259)...' -ForegroundColor Yellow

$apiPath = Join-Path $root 'backend\src\ProjectManager.Api'
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$apiPath'; Write-Host 'BACKEND - dotnet watch run' -ForegroundColor Cyan; dotnet watch run"
)

# --- 3) Frontend -------------------------------------------------------
Write-Host '[3/3] Frontend aciliyor (http://localhost:5173)...' -ForegroundColor Yellow

$webPath = Join-Path $root 'frontend'
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$webPath'; Write-Host 'FRONTEND - npm run dev' -ForegroundColor Cyan; npm run dev"
)

Write-Host ''
Write-Host 'Iki pencere acildi. Durdurmak icin pencerelerde Ctrl+C.' -ForegroundColor Green
Write-Host 'Veritabani arka planda calismaya devam eder.'
Write-Host ''
