# Stop local PostgreSQL database
$PGBIN = Join-Path $PSScriptRoot "..\pgsql_portable\pgsql\bin"
$PGDATA = Join-Path $PSScriptRoot "..\postgres_data"

Write-Host "Stopping PostgreSQL server..." -ForegroundColor Yellow
& "$PGBIN\pg_ctl.exe" -D $PGDATA stop
Write-Host "PostgreSQL stopped." -ForegroundColor Yellow
