# Quick Development Start Script for AgroChain
# This script starts the essential services for development

Write-Host "🚀 Quick Start - AgroChain Development" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow

# Start Ganache in background
Write-Host "Starting local blockchain..." -ForegroundColor Cyan
$ganacheProcess = Start-Process -FilePath "ganache-cli" -ArgumentList "--port", "8545", "--networkId", "1337", "--deterministic" -PassThru -WindowStyle Minimized
Write-Host "✓ Blockchain started (PID: $($ganacheProcess.Id))" -ForegroundColor Green

# Wait for blockchain to be ready
Write-Host "Waiting for blockchain to initialize..." -ForegroundColor Yellow
Start-Sleep 5

# Start the frontend development server
Write-Host "Starting frontend development server..." -ForegroundColor Cyan
Write-Host "🌐 Opening http://localhost:5173" -ForegroundColor Magenta

# Record PIDs for cleanup
Write-Host "`nTo stop all services later:" -ForegroundColor Yellow
Write-Host ("taskkill /F /PID " + $ganacheProcess.Id) -ForegroundColor Gray

# Start Vite dev server (this will keep running)
npm run dev
