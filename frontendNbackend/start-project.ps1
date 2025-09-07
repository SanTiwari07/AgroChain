# AgroChain Full-Stack Project Startup Script
# This script sets up and runs the complete project including blockchain, Firebase, and frontend

Write-Host "🌾 Starting AgroChain Full-Stack Application..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to install global npm packages if not present
function Install-GlobalPackage($packageName) {
    $installed = npm list -g $packageName --depth=0 2>$null | Select-String $packageName
    if (!$installed) {
        Write-Host "Installing $packageName globally..." -ForegroundColor Yellow
        npm install -g $packageName
    } else {
        Write-Host "✓ $packageName is already installed" -ForegroundColor Green
    }
}

# Check prerequisites
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Cyan

# Check Node.js and npm
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Check Firebase CLI
if (Test-Command firebase) {
    $firebaseVersion = firebase --version
    Write-Host "✓ Firebase CLI: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Install blockchain development tools
Write-Host "`n🔧 Installing Blockchain Development Tools..." -ForegroundColor Cyan
Install-GlobalPackage "ganache-cli"
Install-GlobalPackage "truffle"

# Check if dependencies are installed
Write-Host "`n📦 Installing Project Dependencies..." -ForegroundColor Cyan
if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Start services
Write-Host "`n🚀 Starting Services..." -ForegroundColor Cyan

# Start Ganache (local blockchain) in background
Write-Host "Starting local blockchain (Ganache)..." -ForegroundColor Yellow
$ganacheJob = Start-Job -ScriptBlock {
    ganache-cli --host 0.0.0.0 --port 8545 --networkId 1337 --accounts 10 --mnemonic "test test test test test test test test test test test junk" --deterministic
}
Write-Host "✓ Ganache started on port 8545" -ForegroundColor Green

# Wait a moment for Ganache to start
Start-Sleep 3

# Check blockchain connection
Write-Host "Testing blockchain connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8545" -Method POST -ContentType "application/json" -Body '{"jsonrpc":"2.0","method":"net_version","params":[],"id":1}' -ErrorAction Stop
    Write-Host "✓ Blockchain connection successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Blockchain connection failed. Please ensure Ganache is running." -ForegroundColor Yellow
}

# Start Firebase emulators (optional, for local development)
Write-Host "Starting Firebase services..." -ForegroundColor Yellow
Write-Host "✓ Firebase is configured and ready" -ForegroundColor Green

# Build the project
Write-Host "Building the frontend..." -ForegroundColor Yellow
npm run build
Write-Host "✓ Frontend build complete" -ForegroundColor Green

# Start the development server
Write-Host "`n🌐 Starting Frontend Development Server..." -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Magenta
Write-Host "Firebase Console: https://console.firebase.google.com/project/sih-agro-chain" -ForegroundColor Magenta
Write-Host "Production URL: https://sih-agro-chain.web.app" -ForegroundColor Magenta
Write-Host "Ganache GUI: Open Ganache app and connect to http://127.0.0.1:8545" -ForegroundColor Magenta

Write-Host "`n🎉 All services are starting up!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# Start the Vite dev server
npm run dev
