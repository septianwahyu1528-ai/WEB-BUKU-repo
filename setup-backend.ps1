# Setup Backend & Database - Toko Buku
# Run as Administrator

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TOKO BUKU - SETUP OTOMATIS          ║" -ForegroundColor Cyan
Write-Host "║   Backend & Database Installation     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📦 Step 1: Memeriksa Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($nodeVersion) {
    Write-Host "✅ Node.js $nodeVersion terinstall" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js tidak terinstall!" -ForegroundColor Red
    Write-Host "Install dari: https://nodejs.org/" -ForegroundColor Red
    exit
}

Write-Host "`n📦 Step 2: Memeriksa PostgreSQL..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version
    Write-Host "✅ $psqlVersion terinstall" -ForegroundColor Green
} catch {
    Write-Host "⚠️  PostgreSQL tidak ditemukan" -ForegroundColor Red
    Write-Host "Install dari: https://www.postgresql.org/download/" -ForegroundColor Red
    exit
}

Write-Host "`n📦 Step 3: Install Backend Dependencies..." -ForegroundColor Yellow
Write-Host "npm install express cors pg jsonwebtoken dotenv nodemon..." -ForegroundColor Cyan

if (Test-Path ".\package.json") {
    npm install express cors pg jsonwebtoken dotenv nodemon --save
    Write-Host "✅ Dependencies terinstall" -ForegroundColor Green
} else {
    Write-Host "❌ package.json tidak ditemukan!" -ForegroundColor Red
    exit
}

Write-Host "`n📊 Step 4: Setup Database..." -ForegroundColor Yellow
Write-Host "Pastikan PostgreSQL service sudah running..." -ForegroundColor Cyan

Read-Host "Tekan ENTER untuk lanjut ke setup database"

$postgresUser = Read-Host "Masukkan username PostgreSQL (default: postgres)"
if (-not $postgresUser) { $postgresUser = "postgres" }

# Create database dan insert data
Write-Host "Membuat database dan insert data..." -ForegroundColor Cyan
psql -h localhost -U $postgresUser -f ".\database_complete_setup.sql"

if ($?) {
    Write-Host "✅ Database setup berhasil" -ForegroundColor Green
} else {
    Write-Host "❌ Database setup gagal! Check password PostgreSQL." -ForegroundColor Red
}

Write-Host "`n✅ Setup Selesai!" -ForegroundColor Green
Write-Host "`n📋 Langkah Selanjutnya:" -ForegroundColor Yellow
Write-Host "1. Buka 2 terminal PowerShell" -ForegroundColor White
Write-Host "2. Terminal 1: npm run server:dev  (Backend)" -ForegroundColor White
Write-Host "3. Terminal 2: npm run dev         (Frontend)" -ForegroundColor White
Write-Host "`n🔐 Login Credentials:" -ForegroundColor Yellow
Write-Host "Admin: admin@tokobuku.com / admin123" -ForegroundColor White
Write-Host "User:  user@tokobuku.com / user123" -ForegroundColor White
Write-Host "`n🌐 URLs:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "`n"
