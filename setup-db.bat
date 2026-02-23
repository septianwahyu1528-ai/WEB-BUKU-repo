@echo off
REM Script untuk setup database PostgreSQL
REM Jalankan dengan: setup-db.bat

echo.
echo ================================
echo   Toko Buku - Database Setup
echo ================================
echo.

set DB_HOST=localhost
set DB_PORT=5432
set DB_USER=postgres
set DB_NAME=tokobuku_db
set SQL_FILE=database_setup.sql

echo Masukkan password PostgreSQL (user: %DB_USER%):
set /p DB_PASSWORD=

echo.
echo Mengecek PostgreSQL...
psql --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ✗ PostgreSQL tidak ditemukan!
    echo Pastikan PostgreSQL sudah terinstall dan PATH sudah dikonfigurasi.
    echo.
    pause
    exit /b 1
)

echo ✓ PostgreSQL ditemukan
echo.
echo Menjalankan database setup...
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo User: %DB_USER%
echo.

REM Set password environment variable
set PGPASSWORD=%DB_PASSWORD%

REM Jalankan SQL script
echo 1. Membuat database 'tokobuku_db'...
psql -h %DB_HOST% -U %DB_USER% -c "CREATE DATABASE tokobuku_db;" 2>nul

echo 2. Membuat tabel dan insert data...
psql -h %DB_HOST% -d %DB_NAME% -U %DB_USER% -f %SQL_FILE%

if errorlevel 1 (
    echo.
    echo ✗ Setup Database Gagal!
    echo.
    echo Troubleshooting:
    echo   1. Pastikan PostgreSQL sudah running
    echo   2. Periksa username dan password
    echo   3. Pastikan database 'tokobuku_db' belum ada
    echo.
    pause
    exit /b 1
)

echo.
echo ================================
echo   ✓ Setup Database Berhasil!
echo ================================
echo.
echo Database siap digunakan:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.
echo Kredensial Login Test:
echo   Email: admin@tokobuku.com
echo   Password: admin123
echo.

REM Clear password
set PGPASSWORD=

pause
