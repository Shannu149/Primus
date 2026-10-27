param([ValidateSet('Launch','Backend','Frontend')][string]$Mode = 'Launch')
$ErrorActionPreference = 'Stop'
try {
    if ($Mode -eq 'Backend') {
        $Host.UI.RawUI.WindowTitle = 'Primus Backend - keep open'
        Set-Location -LiteralPath $env:PRIMUS_BACKEND
        & .\mvnw.cmd spring-boot:run
        if ($LASTEXITCODE -ne 0) { throw 'Backend failed. Copy the error above (remove any credentials) for troubleshooting.' }
        exit
    }
    if ($Mode -eq 'Frontend') {
        $Host.UI.RawUI.WindowTitle = 'Primus Frontend - keep open'
        Set-Location -LiteralPath $env:PRIMUS_FRONTEND
        & npm.cmd install
        if ($LASTEXITCODE -ne 0) { throw 'npm install failed. Check the error above and your internet connection.' }
        & npm.cmd run dev -- --host localhost --port 5173 --strictPort --open
        if ($LASTEXITCODE -ne 0) { throw 'Frontend failed. Check the error above.' }
        exit
    }
    Write-Host 'PRIMUS GROQ STARTER' -ForegroundColor Cyan
    Write-Host 'Requires Java 17+, Node/npm, internet, and an existing local MySQL database.'
    foreach ($command in @('java.exe','node.exe','npm.cmd')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command was not found. Install it or add it to PATH, then reopen this launcher." }
    }
    $root = $PSScriptRoot
    if (-not ((Test-Path -LiteralPath (Join-Path $root 'demo\pom.xml')) -and (Test-Path -LiteralPath (Join-Path $root 'primus-frontend\package.json')))) {
        $root = (Read-Host 'Paste the full OUTER demo folder path (contains demo and primus-frontend)').Trim().Trim('"')
    }
    $backend = Join-Path $root 'demo'
    $frontend = Join-Path $root 'primus-frontend'
    if (-not (Test-Path -LiteralPath (Join-Path $backend 'mvnw.cmd'))) { throw 'Backend not found. Choose the outer demo folder from the extracted application ZIP.' }
    if (-not (Test-Path -LiteralPath (Join-Path $frontend 'package.json'))) { throw 'primus-frontend was not found in the selected folder.' }
    foreach ($port in @(8080,5173)) {
        if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { throw "Port $port is already in use. Close the old application terminal or identify the program using that port, then retry." }
    }
    if (-not (Test-NetConnection -ComputerName localhost -Port 3306 -InformationLevel Quiet -WarningAction SilentlyContinue)) {
        throw 'MySQL is not reachable on localhost:3306. Start your MySQL service in Windows Services, then retry.'
    }
    $database = Read-Host 'Existing MySQL database name'
    if ($database -notmatch '^[A-Za-z0-9_-]+$') { throw 'Enter a database name using letters, numbers, underscores or hyphens.' }
    $username = Read-Host 'MySQL username (Enter for root)'
    if ([string]::IsNullOrWhiteSpace($username)) { $username = 'root' }
    $password = Read-Host 'MySQL password (hidden)' -AsSecureString
    Write-Host 'Allow Hibernate to add missing tables/columns? Existing rows will not be intentionally deleted.'
    $schemaAnswer = Read-Host 'Type UPDATE to allow schema updates; Enter only validates existing tables'
    $env:SPRING_JPA_HIBERNATE_DDL_AUTO = 'validate'
    if ($schemaAnswer -ceq 'UPDATE') { $env:SPRING_JPA_HIBERNATE_DDL_AUTO = 'update' }
    $env:PRIMUS_BACKEND = $backend
    $env:PRIMUS_FRONTEND = $frontend
    $env:SPRING_DATASOURCE_URL = 'jdbc:mysql://localhost:3306/' + $database
    $env:SPRING_DATASOURCE_USERNAME = $username
    $env:SERVER_PORT = '8080'
    $env:SERVER_ADDRESS = '127.0.0.1'
    $apiSecret = Read-Host 'Groq API key (hidden; Enter for catalogue-only mode)' -AsSecureString
    $apiPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiSecret)
    try { $env:GROQ_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($apiPtr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($apiPtr); $apiSecret.Dispose() }
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    try { $env:SPRING_DATASOURCE_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
    $scriptArg = '"' + $PSCommandPath + '"'
    try {
        Start-Process powershell.exe -ArgumentList @('-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-File',$scriptArg,'-Mode','Backend')
    } finally {
        Remove-Item Env:SPRING_DATASOURCE_PASSWORD -ErrorAction SilentlyContinue
        Remove-Item Env:GROQ_API_KEY -ErrorAction SilentlyContinue
        $password.Dispose()
    }
    Start-Process powershell.exe -ArgumentList @('-NoProfile','-NoExit','-ExecutionPolicy','Bypass','-File',$scriptArg,'-Mode','Frontend')
    Write-Host 'Startup launched. Keep both new windows open. First launch may take several minutes.' -ForegroundColor Green
    Write-Host 'Vite will open http://localhost:5173. Products require a successful backend connection.'
    Write-Host 'If the page loads before the backend starts, refresh after it says Started DemoApplication.'
    Write-Host 'To stop: press Ctrl+C in each application window, then close it.'
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    Read-Host 'Press Enter to close'
    exit 1
}
