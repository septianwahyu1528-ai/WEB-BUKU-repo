# Script untuk setup database PostgreSQL
# Jalankan dengan: powershell -ExecutionPolicy Bypass -File setup-db.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Toko Buku - Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Konfigurasi database
$dbHost = "localhost"
$dbPort = 5432
$dbUser = "postgres"
$dbName = "tokobuku_db"
$sqlFile = "database_setup.sql"

# Minta password
Write-Host "Masukkan password PostgreSQL (user: $dbUser): " -ForegroundColor Yellow -NoNewline
$dbPassword = Read-Host -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($dbPassword))

# Cek apakah psql tersedia
Write-Host ""
Write-Host "Mengecek PostgreSQL..." -ForegroundColor Cyan

try {
    $psqlVersion = psql --version 2>&1
    Write-Host "✓ PostgreSQL ditemukan: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL tidak ditemukan!" -ForegroundColor Red
    Write-Host "Pastikan PostgreSQL sudah terinstall dan PATH sudah dikonfigurasi." -ForegroundColor Red
    Write-Host ""
    Write-Host "Atau set PGPASSWORD dan jalankan: psql -h $dbHost -U $dbUser -f $sqlFile" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Menjalankan database setup..." -ForegroundColor Cyan
Write-Host "Host: $dbHost" -ForegroundColor Gray
Write-Host "Port: $dbPort" -ForegroundColor Gray
Write-Host "User: $dbUser" -ForegroundColor Gray
Write-Host ""

# Set environment variable untuk password
$env:PGPASSWORD = $plainPassword

# Jalankan SQL script
try {
    # Pertama buat database
    Write-Host "1. Membuat database 'tokobuku_db'..." -ForegroundColor Yellow
    psql -h $dbHost -U $dbUser -c "CREATE DATABASE tokobuku_db;"
    
    # Kemudian jalankan script tabel
    Write-Host "2. Membuat tabel dan insert data..." -ForegroundColor Yellow
    
    # Ambil konten file dan hapus CREATE DATABASE statement
    $sqlContent = Get-Content $sqlFile -Raw
    $sqlContent = $sqlContent -replace "CREATE DATABASE tokobuku_db.*?;", ""
    $sqlContent = $sqlContent -replace "-- Connect ke database.*", ""
    
    # Jalankan ke database tokobuku_db
    $sqlContent | psql -h $dbHost -d $dbName -U $dbUser
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "  ✓ Setup Database Berhasil!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Database siap digunakan:" -ForegroundColor Green
    Write-Host "  Host: $dbHost" -ForegroundColor Gray
    Write-Host "  Port: $dbPort" -ForegroundColor Gray
    Write-Host "  Database: $dbName" -ForegroundColor Gray
    Write-Host "  User: $dbUser" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Tabel yang dibuat:" -ForegroundColor Green
    Write-Host "  ✓ users (dengan 2 user sample)" -ForegroundColor Gray
    Write-Host "  ✓ books (dengan 5 buku sample)" -ForegroundColor Gray
    Write-Host "  ✓ customers (dengan 5 pelanggan sample)" -ForegroundColor Gray
    Write-Host "  ✓ orders (kosong, siap untuk transaksi)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Kredensial Login Test:" -ForegroundColor Yellow
    Write-Host "  Email: admin@tokobuku.com" -ForegroundColor Gray
    Write-Host "  Password: admin123" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Red
    Write-Host "  ✗ Setup Database Gagal!" -ForegroundColor Red
    Write-Host "================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Pastikan PostgreSQL sudah running" -ForegroundColor Gray
    Write-Host "  2. Periksa username dan password" -ForegroundColor Gray
    Write-Host "  3. Pastikan database 'tokobuku_db' belum ada" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Atau jalankan manual:" -ForegroundColor Yellow
    Write-Host "  psql -h localhost -U postgres -f database_setup.sql" -ForegroundColor Gray
    exit 1
} finally {
    # Bersihkan password dari memory
    $env:PGPASSWORD = $null
    $plainPassword = $null
}

Write-Host "Tekan Enter untuk keluar..."
Read-Host
