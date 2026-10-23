# Start local PostgreSQL database
$PGBIN = Join-Path $PSScriptRoot "..\pgsql_portable\pgsql\bin"
$PGDATA = Join-Path $PSScriptRoot "..\postgres_data"

if (-not (Test-Path $PGDATA)) {
    Write-Host "Initializing PostgreSQL cluster in $PGDATA..." -ForegroundColor Cyan
    & "$PGBIN\initdb.exe" -D $PGDATA -U postgres -E UTF8 --locale=C -A trust
}

Write-Host "Starting PostgreSQL server on localhost:5432..." -ForegroundColor Green
& "$PGBIN\pg_ctl.exe" -D $PGDATA -l "$PGDATA\server.log" start
Write-Host "PostgreSQL is running." -ForegroundColor Green
