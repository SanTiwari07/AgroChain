# =============================================================================
# 🌾 AgroChain Complete Project Launcher 🌾
# =============================================================================
# This script runs the entire full-stack application in one go:
# - Local Blockchain (Ganache)
# - Firebase Services
# - Frontend Development Server
# - All required dependencies and tools
# =============================================================================

param(
    [switch]$SkipInstall,
    [switch]$Production
)

# Configuration
$PROJECT_DIR = "C:\Users\sanka\Desktop\MyWork+Sham\frontendNbackend"
$GANACHE_PORT = 8545
$DEV_SERVER_PORT = 5173
$BLOCKCHAIN_NETWORK_ID = 1337

# Colors for output
$Colors = @{
    Green = "Green"
    Yellow = "Yellow" 
    Red = "Red"
    Cyan = "Cyan"
    Magenta = "Magenta"
    White = "White"
    Gray = "Gray"
}

function Write-ColorOutput {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Banner {
    param($Title, $Color = "Green")
    Write-ColorOutput "`n$('=' * 80)" $Color
    Write-ColorOutput "🌾 $Title" $Color
    Write-ColorOutput "$('=' * 80)" $Color
}

function Test-Command {
    param($CommandName)
    return [bool](Get-Command -Name $CommandName -ErrorAction SilentlyContinue)
}

function Install-GlobalPackage {
    param($PackageName, $DisplayName = $PackageName)
    
    Write-ColorOutput "Checking $DisplayName..." "Cyan"
    $installed = npm list -g $PackageName --depth=0 2>$null | Select-String $PackageName
    if (!$installed) {
        Write-ColorOutput "Installing $DisplayName globally..." "Yellow"
        npm install -g $PackageName
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ $DisplayName installed successfully" "Green"
        } else {
            Write-ColorOutput "❌ Failed to install $DisplayName" "Red"
            return $false
        }
    } else {
        Write-ColorOutput "✅ $DisplayName is already installed" "Green"
    }
    return $true
}

function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

function Stop-ProcessOnPort {
    param($Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($pid in $processes) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-ColorOutput "Stopped process on port $Port (PID: $pid)" "Yellow"
        }
    } catch {
        # Port not in use, continue
    }
}

function Start-BlockchainService {
    Write-ColorOutput "`nStarting local blockchain (Hardhat)..." "Cyan"
    
    # Kill any existing processes on port 8545
    Stop-ProcessOnPort $GANACHE_PORT
    Start-Sleep 2
    
    # Navigate to smart contracts directory
    $SMART_CONTRACTS_DIR = "$PROJECT_DIR\..\Blockchain\seed-to-shelf-flow-main\smart-contracts"
    
    if (!(Test-Path $SMART_CONTRACTS_DIR)) {
        Write-ColorOutput "❌ Smart contracts directory not found: $SMART_CONTRACTS_DIR" "Red"
        return $false
    }
    
    Set-Location $SMART_CONTRACTS_DIR
    
    # Install smart contract dependencies if needed
    if (!(Test-Path "node_modules")) {
        Write-ColorOutput "Installing smart contract dependencies..." "Yellow"
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Failed to install smart contract dependencies" "Red"
            return $false
        }
    }
    
    # Start Hardhat local node
    Write-ColorOutput "Starting Hardhat blockchain node..." "Yellow"
    $hardhatProcess = Start-Process -FilePath "npm" -ArgumentList "run", "node" -PassThru -WindowStyle Minimized
    
    # Wait for blockchain to initialize
    Write-ColorOutput "Waiting for blockchain to initialize..." "Yellow"
    $timeout = 30
    $counter = 0
    
    do {
        Start-Sleep 1
        $counter++
        Write-Progress -Activity "Initializing Blockchain" -Status "Waiting..." -PercentComplete (($counter / $timeout) * 100)
    } while (!(Test-Port $GANACHE_PORT) -and $counter -lt $timeout)
    
    Write-Progress -Activity "Initializing Blockchain" -Completed
    
    if (Test-Port $GANACHE_PORT) {
        Write-ColorOutput "✅ Blockchain is ready and listening on port $GANACHE_PORT" "Green"
        
        # Deploy smart contracts
        Write-ColorOutput "Deploying AgriChain smart contract..." "Yellow"
        Start-Sleep 3  # Give the node a moment to fully start
        
        try {
            $deployResult = npm run deploy:local 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Smart contract deployed successfully" "Green"
                
                # Extract contract address from deployment output
                $contractAddress = ($deployResult | Select-String "AgriChain deployed to:" | ForEach-Object { $_.Line.Split(" ")[-1] })
                if ($contractAddress) {
                    Write-ColorOutput "📄 Contract Address: $contractAddress" "Magenta"
                }
            } else {
                Write-ColorOutput "⚠️ Smart contract deployment had issues, but blockchain is running" "Yellow"
            }
        } catch {
            Write-ColorOutput "⚠️ Smart contract deployment failed, but blockchain is running" "Yellow"
        }
        
        # Test blockchain connection
        try {
            $testPayload = @{
                jsonrpc = "2.0"
                method = "net_version"
                params = @()
                id = 1
            } | ConvertTo-Json
            
            $response = Invoke-RestMethod -Uri "http://localhost:$GANACHE_PORT" -Method POST -ContentType "application/json" -Body $testPayload -TimeoutSec 5
            Write-ColorOutput "✅ Blockchain connection test successful (Network ID: $($response.result))" "Green"
        } catch {
            Write-ColorOutput "⚠️ Blockchain started but connection test failed" "Yellow"
        }
    } else {
        Write-ColorOutput "❌ Failed to start blockchain service" "Red"
        return $false
    }
    
    return $hardhatProcess
}

function Test-FirebaseConnection {
    Write-ColorOutput "`nTesting Firebase connection..." "Cyan"
    
    Set-Location $PROJECT_DIR
    
    try {
        $firebaseProjects = firebase projects:list --json 2>$null | ConvertFrom-Json
        $currentProject = $firebaseProjects | Where-Object { $_.projectId -eq "agrochain-8d695" }
        
        if ($currentProject) {
            Write-ColorOutput "✅ Firebase connection successful" "Green"
            Write-ColorOutput "   Project: $($currentProject.displayName) ($($currentProject.projectId))" "Gray"
            return $true
        } else {
            Write-ColorOutput "⚠️ Firebase project not found or not accessible" "Yellow"
            return $false
        }
    } catch {
        Write-ColorOutput "⚠️ Firebase connection test failed" "Yellow"
        return $false
    }
}

function Start-DevelopmentServer {
    Write-ColorOutput "`nStarting frontend development server..." "Cyan"
    
    Set-Location $PROJECT_DIR
    
    # Kill any existing processes on dev port
    Stop-ProcessOnPort $DEV_SERVER_PORT
    Start-Sleep 2
    
    # Build the project first
    Write-ColorOutput "Building the project..." "Yellow"
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Project built successfully" "Green"
    } else {
        Write-ColorOutput "⚠️ Build had warnings but continuing..." "Yellow"
    }
    
    # Start development server
    Write-ColorOutput "Launching Vite development server..." "Yellow"
    Write-ColorOutput "🌐 Frontend will be available at: http://localhost:$DEV_SERVER_PORT" "Magenta"
    
    # This will block and run the dev server
    npm run dev
}

function Show-ProjectInfo {
    Write-Banner "🎉 AgroChain Application Started Successfully!" "Green"
    
    Write-ColorOutput "`n📱 Application URLs:" "Cyan"
    Write-ColorOutput "   🖥️  Frontend (Development): http://localhost:$DEV_SERVER_PORT" "White"
    Write-ColorOutput "   🌐 Frontend (Production):   https://agrochain-8d695.web.app" "White"
    Write-ColorOutput "   ⛓️  Blockchain Network:      http://localhost:$GANACHE_PORT" "White"
    Write-ColorOutput "   🔥 Firebase Console:        https://console.firebase.google.com/project/agrochain-8d695" "White"
    
    Write-ColorOutput "`n🔐 MetaMask Network Configuration:" "Cyan"
    Write-ColorOutput "   Network Name:    AgroChain Local (Hardhat)" "White"
    Write-ColorOutput "   RPC URL:         http://localhost:$GANACHE_PORT" "White"
    Write-ColorOutput "   Chain ID:        31337" "White"
    Write-ColorOutput "   Currency Symbol: ETH" "White"
    Write-ColorOutput "   Block Explorer:  Not applicable (Local)" "White"
    
    Write-ColorOutput "`n🎯 Available Features:" "Cyan"
    Write-ColorOutput "   👨‍🌾 Farmer Dashboard    - Register crops, manage inventory" "White"
    Write-ColorOutput "   🚛 Distributor Dashboard - Update supply chain, add transport details" "White"
    Write-ColorOutput "   🏪 Retailer Dashboard   - Manage retail margins, store information" "White"
    Write-ColorOutput "   👥 Customer Scanner     - QR code verification, product authenticity" "White"
    
    Write-ColorOutput "`n⚡ Quick Test Steps:" "Yellow"
    Write-ColorOutput "   1. Open http://localhost:$DEV_SERVER_PORT in your browser" "Gray"
    Write-ColorOutput "   2. Install MetaMask extension if not already installed" "Gray"
    Write-ColorOutput "   3. Add the local network configuration to MetaMask" "Gray"
    Write-ColorOutput "   4. Create account and test different user roles" "Gray"
    Write-ColorOutput "   5. Test blockchain features with sample products" "Gray"
    
    Write-ColorOutput "`n🛑 To stop all services:" "Red"
    Write-ColorOutput "   Press Ctrl+C to stop the development server" "Gray"
    Write-ColorOutput "   Then run: Get-Process *hardhat* | Stop-Process -Force" "Gray"
    Write-ColorOutput "   Or run: Get-Process *node* | Where-Object { $_.ProcessName -eq 'node' } | Stop-Process -Force" "Gray"
    
    Write-ColorOutput "`n📁 Important Files:" "Cyan"
    Write-ColorOutput "   Smart Contract: Blockchain/seed-to-shelf-flow-main/smart-contracts/AgriChain.sol" "White"
    Write-ColorOutput "   Frontend: frontendNbackend/src/" "White"
    Write-ColorOutput "   Blockchain Service: frontendNbackend/src/services/blockchainService.ts" "White"
    Write-ColorOutput "   Documentation: BLOCKCHAIN_INTEGRATION_README.md" "White"
}

# =============================================================================
# Main Execution
# =============================================================================

try {
    Write-Banner "AgroChain Full-Stack Project Launcher" "Green"
    Write-ColorOutput "Starting complete application stack..." "White"
    Write-ColorOutput "Project Directory: $PROJECT_DIR" "Gray"
    
    # Check if project directory exists
    if (!(Test-Path $PROJECT_DIR)) {
        Write-ColorOutput "❌ Project directory not found: $PROJECT_DIR" "Red"
        Write-ColorOutput "Please ensure the project exists at the specified location." "Yellow"
        exit 1
    }
    
    Set-Location $PROJECT_DIR
    
    # Step 1: Check Prerequisites
    Write-Banner "Step 1: Checking Prerequisites" "Cyan"
    
    if (!(Test-Command "node")) {
        Write-ColorOutput "❌ Node.js is not installed. Please install Node.js first." "Red"
        Write-ColorOutput "   Download from: https://nodejs.org/" "Yellow"
        exit 1
    }
    
    $nodeVersion = node --version
    Write-ColorOutput "✅ Node.js: $nodeVersion" "Green"
    
    if (!(Test-Command "npm")) {
        Write-ColorOutput "❌ npm is not installed." "Red"
        exit 1
    }
    
    $npmVersion = npm --version
    Write-ColorOutput "✅ npm: v$npmVersion" "Green"
    
    # Step 2: Install Global Tools (if not skipped)
    if (!$SkipInstall) {
        Write-Banner "Step 2: Installing Development Tools" "Cyan"
        
        Install-GlobalPackage "firebase-tools" "Firebase CLI"
        Install-GlobalPackage "ganache-cli" "Ganache CLI"
        
        # Install project dependencies
        Write-ColorOutput "`nChecking project dependencies..." "Cyan"
        if (!(Test-Path "node_modules") -or $args -contains "--fresh") {
            Write-ColorOutput "Installing npm dependencies..." "Yellow"
            npm install
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Dependencies installed successfully" "Green"
            } else {
                Write-ColorOutput "❌ Failed to install dependencies" "Red"
                exit 1
            }
        } else {
            Write-ColorOutput "✅ Dependencies already installed" "Green"
        }
    }
    
    # Step 3: Start Blockchain Service
    Write-Banner "Step 3: Starting Blockchain Service" "Cyan"
    $ganacheProcess = Start-BlockchainService
    
    if (!$ganacheProcess) {
        Write-ColorOutput "❌ Failed to start blockchain service" "Red"
        exit 1
    }
    
    # Step 4: Test Firebase Connection
    Write-Banner "Step 4: Verifying Firebase Services" "Cyan"
    Test-FirebaseConnection
    
    # Step 5: Start Development Server
    Write-Banner "Step 5: Starting Frontend Application" "Cyan"
    
    # Show project information before starting server
    Show-ProjectInfo
    
    Write-ColorOutput "`nStarting development server in 3 seconds..." "Yellow"
    Write-ColorOutput "Press Ctrl+C anytime to stop all services." "Gray"
    Start-Sleep 3
    
    # Start the development server (this will block)
    Start-DevelopmentServer
    
} catch {
    Write-ColorOutput "`n❌ An error occurred: $($_.Exception.Message)" "Red"
    Write-ColorOutput "Check the console output above for details." "Yellow"
    exit 1
} finally {
    # Cleanup on exit
    Write-ColorOutput "`n🛑 Shutting down services..." "Yellow"
    
    # Kill Ganache processes
    Get-Process -Name "*ganache*" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    # Kill any processes on our ports
    Stop-ProcessOnPort $GANACHE_PORT
    Stop-ProcessOnPort $DEV_SERVER_PORT
    
    Write-ColorOutput "✅ All services stopped." "Green"
}
