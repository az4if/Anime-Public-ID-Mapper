@echo off
set PSQL="C:\Program Files\PostgreSQL\17\bin\psql.exe"
set DB="postgresql://postgres:[YOUR_PASSWORD]@db.djadjdankafudmaaladj.supabase.co:5432/postgres"

echo Step 1: Dropping existing store table...
%PSQL% -d %DB% -c "DROP TABLE IF EXISTS public.store CASCADE;"

echo Step 2: Restoring from zenshin_sql.sql (this may take a few minutes)...
%PSQL% -d %DB% -f anime-db.sql

echo Done!
pause