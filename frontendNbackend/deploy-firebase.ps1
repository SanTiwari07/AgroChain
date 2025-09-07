# Firebase Deployment Script for AgroChain
# This script handles the complete deployment process to Firebase

Write-Host "🔥 Firebase Deployment Script for AgroChain" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check prerequisites
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Cyan

# Check Node.js and npm
if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Write-Host "Choose the LTS (Long Term Support) version" -ForegroundColor Yellow
    exit 1
}

if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Check/Install Firebase CLI
if (Test-Command firebase) {
    $firebaseVersion = firebase --version
    Write-Host "✓ Firebase CLI: $firebaseVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    npm install -g firebase-tools
    
    if (Test-Command firebase) {
        Write-Host "✓ Firebase CLI installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Firebase CLI" -ForegroundColor Red
        exit 1
    }
}

# Install project dependencies
Write-Host "`n📦 Installing Project Dependencies..." -ForegroundColor Cyan
if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
}

# Build the project
Write-Host "`n🏗️ Building the Project..." -ForegroundColor Cyan
Write-Host "Building for production..." -ForegroundColor Yellow
npm run build

if (Test-Path "build") {
    Write-Host "✓ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please check for errors above." -ForegroundColor Red
    exit 1
}

# Check Firebase login status
Write-Host "`n🔐 Checking Firebase Authentication..." -ForegroundColor Cyan
try {
    $loginStatus = firebase list --json 2>$null | ConvertFrom-Json
    Write-Host "✓ Already logged into Firebase" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged into Firebase. Starting login process..." -ForegroundColor Yellow
    Write-Host "This will open a browser window. Please:" -ForegroundColor Yellow
    Write-Host "1. Sign in with your Gmail account that owns the 'sih-agro-chain' project" -ForegroundColor Yellow
    Write-Host "2. Allow Firebase CLI to access your account" -ForegroundColor Yellow
    
    firebase login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully logged into Firebase" -ForegroundColor Green
    } else {
        Write-Host "❌ Firebase login failed" -ForegroundColor Red
        exit 1
    }
}

# Verify project configuration
Write-Host "`n🎯 Verifying Project Configuration..." -ForegroundColor Cyan
if (Test-Path ".firebaserc") {
    $firebaserc = Get-Content ".firebaserc" | ConvertFrom-Json
    $projectId = $firebaserc.projects.default
    Write-Host "✓ Project ID: $projectId" -ForegroundColor Green
    
    if ($projectId -eq "sih-agro-chain") {
        Write-Host "✓ Project configuration is correct" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: Project ID doesn't match expected 'sih-agro-chain'" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ .firebaserc file not found" -ForegroundColor Red
    exit 1
}

# Deploy to Firebase
Write-Host "`n🚀 Deploying to Firebase..." -ForegroundColor Cyan
Write-Host "Uploading your application to Firebase Hosting..." -ForegroundColor Yellow

firebase deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 Deployment Successful!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Yellow
    Write-Host "Your AgroChain application is now live!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Live URL: https://sih-agro-chain.web.app" -ForegroundColor Magenta
    Write-Host "🔧 Firebase Console: https://console.firebase.google.com/project/sih-agro-chain" -ForegroundColor Magenta
    Write-Host "📊 Analytics: Available in Firebase Console" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "✅ Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Open your live URL to test the application" -ForegroundColor White
    Write-Host "2. Create user accounts and test all features" -ForegroundColor White
    Write-Host "3. Monitor usage in Firebase Console" -ForegroundColor White
    Write-Host "4. Set up production security rules if needed" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "`n❌ Deployment Failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Cyan
    Write-Host "1. Ensure you're logged into the correct Google account" -ForegroundColor White
    Write-Host "2. Check that the Firebase project exists and you have access" -ForegroundColor White
    Write-Host "3. Verify your internet connection" -ForegroundColor White
    Write-Host "4. Try running: firebase login --reauth" -ForegroundColor White
    exit 1
}

Write-Host "`nDeployment script completed!" -ForegroundColor Green
