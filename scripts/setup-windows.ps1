$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

function Step($Message) { Write-Host "`n[RotaAgil] $Message" -ForegroundColor Red }
function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  throw "O Windows Package Manager (winget) e necessario. Instale/atualize o App Installer pela Microsoft Store."
}

Step "Instalando Node.js LTS"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  winget install --id OpenJS.NodeJS.LTS --exact --silent --accept-package-agreements --accept-source-agreements
  Refresh-Path
}

Step "Verificando Docker Desktop"
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  winget install --id Docker.DockerDesktop --exact --silent --accept-package-agreements --accept-source-agreements
  Refresh-Path
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  $env:Path += ";$env:ProgramFiles\Docker\Docker\resources\bin"
}

try { docker info *> $null } catch {
  Step "Iniciando Docker Desktop (a primeira execucao pode solicitar a ativacao do WSL 2)"
  $dockerDesktop = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  if (-not (Test-Path $dockerDesktop)) { throw "Docker Desktop nao foi localizado apos a instalacao." }
  Start-Process $dockerDesktop
  $ready = $false
  1..60 | ForEach-Object { if (-not $ready) { Start-Sleep -Seconds 2; try { docker info *> $null; $ready = $true } catch {} } }
  if (-not $ready) { throw "Docker Desktop nao iniciou. Abra-o, conclua a configuracao do WSL 2 e execute este script novamente." }
}

Set-Location $Root
Step "Iniciando PostgreSQL"
docker compose up -d postgres
$ready = $false
1..30 | ForEach-Object { if (-not $ready) { Start-Sleep -Seconds 2; docker compose exec -T postgres pg_isready -U postgres -d entregadores *> $null; if ($LASTEXITCODE -eq 0) { $ready = $true } } }
if (-not $ready) { throw "O PostgreSQL nao ficou pronto no tempo esperado." }

Step "Instalando dependencias"
npm.cmd --prefix backend install
npm.cmd --prefix frontend install
if (-not (Test-Path "backend\.env")) { Copy-Item "backend\.env.example" "backend\.env" }

Step "Aplicando migrations e criando a base demonstrativa"
Push-Location backend
npm.cmd run db:setup
Pop-Location

Step "Setup concluido"
Write-Host "Abra dois terminais e execute:" -ForegroundColor Green
Write-Host "  cd `"$Root\backend`"; npm run start:dev"
Write-Host "  cd `"$Root\frontend`"; npm run dev"
Write-Host "Acesse http://localhost:5173 e use admin@demo.com / Demo@123"
