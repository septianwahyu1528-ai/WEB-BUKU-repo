# ⚠️ LANGKAH PENTING: Install PostgreSQL

## 1. Download PostgreSQL Installer
Kunjungi: https://www.postgresql.org/download/windows/

Pilih versi terbaru (PostgreSQL 15+ recommended)

## 2. Jalankan Installer
- Klik Next hingga step "Database Port"
- Set port ke: **5432**
- Set password superuser (postgres) ke: **postgres**
- Finish installation

## 3. Start PostgreSQL Service
Setelah instalasi selesai, PostgreSQL service akan otomatis berjalan.

Untuk memverifikasi:
```powershell
Get-Service postgresql*
```

Jika belum berjalan, start service:
```powershell
Start-Service postgresql-x64-15  # Sesuaikan versi
```

## 4. Create User untuk Aplikasi
Buka pgAdmin atau command prompt dan buat user:

```sql
CREATE USER tokobuku_user WITH PASSWORD 'tokobuku_password';
ALTER USER tokobuku_user CREATEDB;
```

Atau jalankan command:
```powershell
$env:PGPASSWORD = 'postgres'
psql -U postgres -c "CREATE USER tokobuku_user WITH PASSWORD 'tokobuku_password';"
psql -U postgres -c "ALTER USER tokobuku_user CREATEDB;"
```

## 5. Jalankan Setup Database
Setelah PostgreSQL terinstall dan berjalan:

```bash
npm run setup-db
```

## Troubleshooting

### PostgreSQL belum terinstall
Download: https://www.postgresql.org/download/windows/

### Port 5432 sudah terpakai
Ubah port di `.env`:
```
DB_PORT=5433
```

### Password salah
Reset password superuser:
```powershell
# Windows CMD
postgres=# ALTER USER postgres WITH PASSWORD 'new_password';
```

Setelah selesai setup PostgreSQL, jalankan kembali:
```bash
npm run setup-db
```
