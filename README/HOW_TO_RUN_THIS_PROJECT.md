# 🚀 How to Run AgroChain Project - Complete A to Z Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Step 1: Install Required Software](#step-1-install-required-software)
4. [Step 2: Clone and Setup Project](#step-2-clone-and-setup-project)
5. [Step 3: Firebase Setup](#step-3-firebase-setup)
6. [Step 4: Blockchain Setup](#step-4-blockchain-setup)
7. [Step 5: Frontend Setup](#step-5-frontend-setup)
8. [Step 6: Running the Application](#step-6-running-the-application)
9. [Step 7: Testing the Application](#step-7-testing-the-application)
10. [Troubleshooting](#troubleshooting)
11. [Production Deployment](#production-deployment)

---

## Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 5GB free space
- **Internet**: Stable internet connection

### Required Accounts
- **Google Account**: For Firebase services
- **GitHub Account**: For code repository (optional)

---

## Project Overview

**AgroChain** is a blockchain-powered agricultural supply chain management platform with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Firebase (Authentication + Firestore)
- **Blockchain**: Ethereum smart contracts (Hardhat)
- **Deployment**: Firebase Hosting

### Project Structure
```
MyWork+Sham/
├── frontendNbackend/          # Main React application
├── Blockchain/                # Smart contracts
└── README.md
```

---

## Step 1: Install Required Software

### 1.1 Install Node.js
1. **Download Node.js**:
   - Go to [https://nodejs.org/](https://nodejs.org/)
   - Download **LTS version** (recommended)
   - Choose Windows Installer (.msi)

2. **Install Node.js**:
   - Run the downloaded installer
   - Follow the installation wizard
   - **Important**: Check "Add to PATH" option
   - Restart your computer after installation

3. **Verify Installation**:
   ```bash
   node --version
   npm --version
   ```
   Both commands should return version numbers.

### 1.2 Install Git (if not already installed)
1. **Download Git**:
   - Go to [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Download for Windows

2. **Install Git**:
   - Run the installer
   - Use default settings
   - Restart command prompt after installation

3. **Verify Installation**:
   ```bash
   git --version
   ```

### 1.3 Install Visual Studio Code (Recommended)
1. **Download VS Code**:
   - Go to [https://code.visualstudio.com/](https://code.visualstudio.com/)
   - Download for Windows

2. **Install VS Code**:
   - Run the installer
   - Use default settings

---

## Step 2: Clone and Setup Project

### 2.1 Download Project
**Option A: If you have the project files**
- Extract the project to a folder (e.g., `C:\Users\YourName\Desktop\AgroChain`)

**Option B: If cloning from repository**
```bash
git clone <repository-url>
cd AgroChain
```

### 2.2 Verify Project Structure
Ensure you have these folders:
```
MyWork+Sham/
├── frontendNbackend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── firebase.json
└── Blockchain/
    └── seed-to-shelf-flow-main/
        └── smart-contracts/
```

---

## Step 3: Firebase Setup

### 3.1 Create Firebase Project
1. **Go to Firebase Console**:
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**:
   - Click "Create a project"
   - Project name: `sih-agro-chain` (or your preferred name)
   - Enable Google Analytics: **Yes** (recommended)
   - Choose Analytics account or create new one
   - Click "Create project"

3. **Wait for Project Creation**:
   - This may take 1-2 minutes

### 3.2 Enable Firebase Services
1. **Enable Authentication**:
   - In Firebase Console, go to "Authentication"
   - Click "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider
   - Click "Save"

2. **Enable Firestore Database**:
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location (choose closest to you)
   - Click "Done"

3. **Enable Hosting**:
   - Go to "Hosting"
   - Click "Get started"
   - Follow the setup wizard

### 3.3 Get Firebase Configuration
1. **Get Web App Config**:
   - In Firebase Console, go to "Project Settings" (gear icon)
   - Scroll down to "Your apps" section
   - Click "Web" icon (`</>`)
   - App nickname: `AgroChain Web`
   - Check "Also set up Firebase Hosting"
   - Click "Register app"

2. **Copy Configuration**:
   - Copy the `firebaseConfig` object
   - It should look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id",
     measurementId: "your-measurement-id"
   };
   ```

3. **Update Firebase Config**:
   - Open `frontendNbackend/firebase.js`
   - Replace the existing config with your copied config
   - Save the file

### 3.4 Install Firebase CLI
1. **Open Command Prompt as Administrator**:
   - Press `Win + R`
   - Type `cmd`
   - Press `Ctrl + Shift + Enter`

2. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

3. **Verify Installation**:
   ```bash
   firebase --version
   ```

4. **Login to Firebase**:
   ```bash
   firebase login
   ```
   - This will open a browser window
   - Sign in with your Google account
   - Allow Firebase CLI access

---

## Step 4: Blockchain Setup

### 4.1 Install Hardhat Dependencies
1. **Open Command Prompt**:
   - Navigate to blockchain directory:
   ```bash
   cd Blockchain/seed-to-shelf-flow-main/smart-contracts
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Verify Installation**:
   ```bash
   npx hardhat --version
   ```

### 4.2 Deploy Smart Contract
1. **Start Local Blockchain**:
   ```bash
   npx hardhat node
   ```
   - This starts a local Ethereum network
   - **Keep this terminal open** - don't close it
   - Note the private keys and addresses shown

2. **Open New Terminal**:
   - Open another command prompt
   - Navigate to the same directory:
   ```bash
   cd Blockchain/seed-to-shelf-flow-main/smart-contracts
   ```

3. **Deploy Contract**:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```
   - This will deploy the smart contract
   - **Copy the contract address** (e.g., `0x5FbDB2315678afecb367f032d93F642f64180aa3`)

4. **Update Contract Address**:
   - Open `frontendNbackend/src/services/blockchainService.ts`
   - Find line 19: `export const AGRICHAIN_CONTRACT_ADDRESS = "..."`
   - Replace with your deployed contract address
   - Save the file

### 4.3 Setup MetaMask
1. **Install MetaMask**:
   - Go to [https://metamask.io/](https://metamask.io/)
   - Click "Download now"
   - Install the browser extension

2. **Create Wallet**:
   - Click "Create a new wallet"
   - Set a strong password
   - **Important**: Save your seed phrase securely
   - Complete the setup

3. **Add Local Network**:
   - Click MetaMask extension
   - Click network dropdown (top)
   - Click "Add network"
   - Click "Add a network manually"
   - Fill in these details:
     - **Network Name**: `AgroChain Local`
     - **RPC URL**: `http://127.0.0.1:8545`
     - **Chain ID**: `31337`
     - **Currency Symbol**: `ETH`
     - **Block Explorer URL**: (leave empty)
   - Click "Save"

4. **Import Test Account**:
   - In the terminal where `npx hardhat node` is running
   - Copy one of the private keys (starts with `0x`)
   - In MetaMask, click account icon (top right)
   - Click "Import Account"
   - Paste the private key
   - Click "Import"

---

## Step 5: Frontend Setup

### 5.1 Install Frontend Dependencies
1. **Open Command Prompt**:
   - Navigate to frontend directory:
   ```bash
   cd frontendNbackend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   - This may take 2-5 minutes
   - Wait for completion

3. **Verify Installation**:
   ```bash
   npm list --depth=0
   ```

### 5.2 Configure Environment
1. **Check Firebase Config**:
   - Ensure `firebase.js` has your Firebase configuration
   - Verify all fields are filled correctly

2. **Check Blockchain Config**:
   - Ensure `blockchainService.ts` has correct contract address
   - Verify the contract address matches your deployment

---

## Step 6: Running the Application

### 6.1 Start All Services

**Terminal 1: Blockchain Network**
```bash
cd Blockchain/seed-to-shelf-flow-main/smart-contracts
npx hardhat node
```
- Keep this running
- You should see "Started HTTP and WebSocket JSON-RPC server"

**Terminal 2: Frontend Development Server**
```bash
cd frontendNbackend
npm run dev
```
- Wait for "Local: http://localhost:3000" message
- The app will open automatically in your browser

### 6.2 Verify Everything is Working
1. **Check Browser**:
   - Application should open at `http://localhost:3000`
   - You should see the AgroChain homepage

2. **Test Firebase Connection**:
   - Try to sign up for a new account
   - Check if account is created in Firebase Console

3. **Test Blockchain Connection**:
   - Go to any dashboard (Farmer/Distributor/Retailer)
   - Click "Connect Wallet"
   - MetaMask should open and connect
   - You should see "Blockchain: Connected"

---

## Step 7: Testing the Application

### 7.1 Test User Registration
1. **Go to Homepage**: `http://localhost:3000`
2. **Select Role**: Choose Farmer, Distributor, or Retailer
3. **Sign Up**: Create a new account
4. **Verify**: Check Firebase Console for new user

### 7.2 Test Blockchain Features
1. **Connect Wallet**: Click "Connect Wallet" in dashboard
2. **Register Product** (Farmer):
   - Click "Add New Crop"
   - Fill in crop details
   - Click "Register on Blockchain"
   - Check MetaMask for transaction

3. **Scan QR Code** (Distributor/Retailer):
   - Use camera to scan QR codes
   - Verify product information loads

4. **Verify Product** (Customer):
   - Go to Customer section
   - Scan QR code
   - Check blockchain verification

### 7.3 Test All User Roles
- **Farmer**: Register crops, generate QR codes
- **Distributor**: Scan QR codes, update blockchain
- **Retailer**: Scan QR codes, record sales
- **Customer**: Verify product authenticity

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Node.js not recognized"
**Solution**:
- Restart your computer after installing Node.js
- Check if Node.js is added to PATH
- Reinstall Node.js if needed

#### Issue 2: "Firebase login failed"
**Solution**:
```bash
firebase logout
firebase login
```

#### Issue 3: "Contract not found"
**Solution**:
- Ensure blockchain is running (`npx hardhat node`)
- Check contract address in `blockchainService.ts`
- Redeploy contract if needed

#### Issue 4: "MetaMask connection failed"
**Solution**:
- Ensure MetaMask is installed and unlocked
- Check if local network is added
- Try refreshing the page

#### Issue 5: "Port already in use"
**Solution**:
```bash
# Kill process using port 3000
npx kill-port 3000
# Or use different port
npm run dev -- --port 3001
```

#### Issue 6: "Firebase config error"
**Solution**:
- Check `firebase.js` configuration
- Ensure all fields are filled
- Verify project ID is correct

### Getting Help
1. **Check Console**: Open browser developer tools (F12)
2. **Check Terminal**: Look for error messages
3. **Check Firebase Console**: Verify services are enabled
4. **Check MetaMask**: Ensure wallet is connected

---

## Production Deployment

### Deploy to Firebase Hosting
1. **Build the Project**:
   ```bash
   cd frontendNbackend
   npm run build
   ```

2. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

3. **Access Live Site**:
   - Your app will be available at `https://your-project-id.web.app`

### Deploy Smart Contract to Testnet
1. **Get Testnet ETH**:
   - Use faucets like [https://faucets.chain.link/](https://faucets.chain.link/)
   - Add testnet to MetaMask

2. **Deploy Contract**:
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

3. **Update Contract Address**:
   - Update `blockchainService.ts` with new address

---

## Quick Start Commands

### Development
```bash
# Start blockchain
cd Blockchain/seed-to-shelf-flow-main/smart-contracts
npx hardhat node

# Start frontend (new terminal)
cd frontendNbackend
npm run dev
```

### Production
```bash
# Build and deploy
cd frontendNbackend
npm run build
firebase deploy
```

---

## Project URLs

- **Local Development**: http://localhost:3000
- **Firebase Console**: https://console.firebase.google.com/
- **MetaMask**: Browser extension
- **Hardhat Network**: http://127.0.0.1:8545

---

## Support

### If You Get Stuck
1. **Check this guide** step by step
2. **Verify all prerequisites** are installed
3. **Check error messages** in console and terminal
4. **Restart services** if needed
5. **Contact support** with specific error messages

### Success Indicators
✅ Node.js and npm working  
✅ Firebase CLI installed and logged in  
✅ Hardhat node running  
✅ Frontend server running  
✅ MetaMask connected  
✅ All user roles working  
✅ Blockchain transactions successful  

---

**🎉 Congratulations! You now have AgroChain running locally with full blockchain and Firebase integration!**

*This guide covers everything from A to Z. Follow each step carefully for the best results.*
