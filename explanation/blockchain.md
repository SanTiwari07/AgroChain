# 🌾 Blockchain Technology in KrishiSetu

## Table of Contents
1. [What is Blockchain?](#what-is-blockchain)
2. [Why Blockchain for Agriculture?](#why-blockchain-for-agriculture)
3. [Our Smart Contract: KrishiSetu.sol](#our-smart-contract-krishisetusol)
4. [Blockchain Architecture](#blockchain-architecture)
5. [Key Features & Functions](#key-features--functions)
6. [How It Works Step by Step](#how-it-works-step-by-step)
7. [Technical Implementation](#technical-implementation)
8. [Security & Transparency](#security--transparency)
9. [Deployment & Network](#deployment--network)
10. [Integration with Frontend](#integration-with-frontend)

---

## What is Blockchain?

### Basic Concept
**Blockchain** is a distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography. Think of it as a digital notebook that:

- **Cannot be altered** once written
- **Is distributed** across many computers
- **Is transparent** to all participants
- **Is secure** through cryptographic hashing

### Key Characteristics
1. **Decentralized**: No single authority controls it
2. **Immutable**: Data cannot be changed once recorded
3. **Transparent**: All transactions are visible
4. **Secure**: Protected by cryptographic algorithms
5. **Consensus-based**: Network agrees on valid transactions

### Real-World Analogy
Imagine a public ledger book that:
- Everyone has a copy of
- Every entry is verified by multiple people
- Once written, pages cannot be torn or modified
- Everyone can see all entries but cannot change them

---

## Why Blockchain for Agriculture?

### Problems in Traditional Supply Chain
1. **Lack of Transparency**: Consumers don't know where their food comes from
2. **Food Fraud**: Fake organic products, mislabeled items
3. **Traceability Issues**: Hard to track contamination sources
4. **Trust Issues**: Middlemen can manipulate information
5. **Inefficient Processes**: Paper-based tracking systems

### Blockchain Solutions
1. **Complete Transparency**: Every step is recorded and visible
2. **Immutable Records**: Cannot be tampered with
3. **Real-time Tracking**: Instant updates across the chain
4. **Trust Building**: Cryptographic proof of authenticity
5. **Cost Reduction**: Eliminates intermediaries and paperwork

### Benefits for Each Stakeholder

#### 🌱 **Farmers**
- **Fair Pricing**: Transparent pricing throughout the chain
- **Direct Access**: Connect directly with distributors/retailers
- **Quality Recognition**: Get credit for high-quality products
- **Market Access**: Reach broader markets

#### 🚛 **Distributors**
- **Efficient Logistics**: Real-time tracking of products
- **Quality Assurance**: Verify product authenticity
- **Cost Management**: Transparent pricing and margins
- **Customer Trust**: Build reputation through transparency

#### 🏪 **Retailers**
- **Product Authenticity**: Verify product origins
- **Quality Control**: Track product journey
- **Customer Confidence**: Provide transparency to customers
- **Supply Chain Efficiency**: Better inventory management

#### 👥 **Customers**
- **Food Safety**: Know exactly where food comes from
- **Quality Assurance**: Verify organic/fair-trade claims
- **Support Farmers**: Direct connection to producers
- **Informed Choices**: Make decisions based on complete information

---

## Our Smart Contract: KrishiSetu.sol

### What is a Smart Contract?
A **smart contract** is a self-executing contract with the terms of the agreement directly written into code. It automatically executes when predetermined conditions are met.

### Our KrishiSetu Smart Contract
Located at: `Blockchain/seed-to-shelf-flow-main/smart-contracts/contracts/KrishiSetu.sol`

#### Key Components:

```solidity
// Product structure to store all product information
struct Product {
    string id;              // Unique product ID
    string name;            // Product name (e.g., "Wheat", "Rice")
    uint256 quantity;       // Quantity in kg
    uint256 basePrice;      // Original price from farmer
    uint256 currentPrice;   // Current price after all additions
    string harvestDate;     // Harvest date
    string quality;         // Quality grade: A, B, or C
    string status;          // Current status in supply chain
    address farmer;         // Farmer's wallet address
    address distributor;    // Distributor's wallet address
    address retailer;       // Retailer's wallet address
    string location;        // Farm location
    uint256 timestamp;      // Registration timestamp
    bool exists;            // Flag to check if product exists
}
```

#### Transaction History Structure:
```solidity
struct Transaction {
    string productId;       // Associated product ID
    address actor;          // Address of person making transaction
    string action;          // Action performed
    uint256 newPrice;       // Price after this transaction
    string details;         // Additional details
    uint256 timestamp;      // Transaction timestamp
    uint256 blockNumber;    // Block number for verification
}
```

---

## Blockchain Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Smart Contract│  │   Ethereum      │  │   MetaMask   │ │
│  │   (KrishiSetu)  │  │   Network       │  │   Wallet     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Hardhat       │  │   Ethers.js     │  │   Web3       │ │
│  │   (Development) │  │   (Integration) │  │   Provider   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### 1. **Solidity** (Smart Contract Language)
- **Purpose**: Write smart contracts for Ethereum
- **Version**: ^0.8.19
- **Features Used**:
  - Structs for data organization
  - Mappings for efficient data storage
  - Events for logging
  - Modifiers for access control

#### 2. **Hardhat** (Development Framework)
- **Purpose**: Development environment for Ethereum
- **Features**:
  - Local blockchain network
  - Contract compilation
  - Testing framework
  - Deployment scripts

#### 3. **Ethers.js** (JavaScript Library)
- **Purpose**: Interact with Ethereum blockchain from frontend
- **Version**: ^6.15.0
- **Features**:
  - Wallet connection
  - Contract interaction
  - Transaction management

#### 4. **MetaMask** (Wallet)
- **Purpose**: Browser wallet for blockchain interaction
- **Features**:
  - Account management
  - Transaction signing
  - Network switching

---

## Key Features & Functions

### 1. **Product Registration** (Farmer Function)
```solidity
function registerProduct(
    string memory _id,
    string memory _name,
    uint256 _quantity,
    uint256 _basePrice,
    string memory _harvestDate,
    string memory _quality,
    string memory _location
) public
```

**What it does:**
- Creates a new product entry on blockchain
- Records farmer's wallet address
- Sets initial price and status
- Generates unique product ID
- Emits events for transparency

**Access Control:**
- Only the farmer who calls this function can register
- Product ID must be unique
- All fields must be valid (quantity > 0, price > 0)

### 2. **Distributor Update** (Distributor Function)
```solidity
function updateAsDistributor(
    string memory _productId,
    uint256 _handlingCost,
    string memory _transportDetails
) public
```

**What it does:**
- Updates product status to "In Transit"
- Adds handling/transport costs to price
- Records distributor's wallet address
- Logs transportation details
- Updates product history

**Business Logic:**
- Product must exist and be "Available for Distribution"
- Only one distributor can handle a product
- Price increases by handling cost

### 3. **Retailer Update** (Retailer Function)
```solidity
function updateAsRetailer(
    string memory _productId,
    uint256 _retailMargin,
    string memory _storeDetails
) public
```

**What it does:**
- Updates product status to "Available for Consumers"
- Adds retail margin to final price
- Records retailer's wallet address
- Logs store details
- Completes supply chain journey

**Business Logic:**
- Product must be "In Transit" status
- Only one retailer can handle a product
- Final price = base price + handling cost + retail margin

### 4. **Product Verification** (Public Function)
```solidity
function verifyProduct(string memory _productId) 
    public view returns (
        bool verified,
        uint256 totalSteps,
        address[] memory actors,
        string[] memory actions,
        uint256[] memory timestamps
    )
```

**What it does:**
- Verifies product authenticity
- Returns complete transaction history
- Shows all actors in the supply chain
- Provides timestamps for each step
- Enables complete traceability

### 5. **Data Retrieval Functions**
- `getProduct()`: Get complete product information
- `getProductHistory()`: Get all transactions for a product
- `getAllProductIds()`: Get list of all products
- `getContractStats()`: Get system statistics

---

## How It Works Step by Step

### Step 1: Farmer Registration
1. **Farmer connects MetaMask wallet**
2. **Calls `registerProduct()` function**
3. **Provides product details**:
   - Product name (e.g., "Organic Wheat")
   - Quantity (e.g., 100 kg)
   - Base price (e.g., ₹50/kg)
   - Harvest date
   - Quality grade (A/B/C)
   - Farm location
4. **Smart contract creates product record**
5. **Transaction is mined and recorded on blockchain**
6. **Product status: "Available for Distribution"**

### Step 2: Distributor Pickup
1. **Distributor scans QR code or searches product ID**
2. **Verifies product details and farmer information**
3. **Calls `updateAsDistributor()` function**
4. **Provides**:
   - Handling cost (e.g., ₹10/kg)
   - Transport details (truck ID, driver info)
5. **Smart contract updates product**:
   - Status: "In Transit"
   - Price: ₹50 + ₹10 = ₹60/kg
   - Records distributor address
6. **Transaction recorded on blockchain**

### Step 3: Retailer Receipt
1. **Retailer receives product from distributor**
2. **Verifies product through blockchain**
3. **Calls `updateAsRetailer()` function**
4. **Provides**:
   - Retail margin (e.g., ₹15/kg)
   - Store details (address, storage conditions)
5. **Smart contract updates product**:
   - Status: "Available for Consumers"
   - Final price: ₹50 + ₹10 + ₹15 = ₹75/kg
   - Records retailer address
6. **Product ready for customer purchase**

### Step 4: Customer Verification
1. **Customer scans QR code on product**
2. **Frontend calls `verifyProduct()` function**
3. **Blockchain returns complete history**:
   - Farmer details and farm location
   - Harvest date and quality grade
   - Distributor and transport information
   - Retailer and store details
   - Price breakdown at each step
   - Timestamps for all transactions
4. **Customer sees complete transparency**

---

## Technical Implementation

### Smart Contract Deployment

#### 1. **Local Development Setup**
```bash
# Navigate to smart contracts directory
cd Blockchain/seed-to-shelf-flow-main/smart-contracts

# Install dependencies
npm install

# Start local blockchain (Hardhat network)
npx hardhat node

# Deploy contract (in another terminal)
npx hardhat run scripts/deploy.js --network localhost
```

#### 2. **Contract Address Management**
- **Local Development**: `0x0165878A594ca255338adfa4d48449f69242Eb8F`
- **Environment Variables**: Can be configured via `.env` file
- **Network Configuration**: Supports multiple networks (localhost, Sepolia testnet)

#### 3. **ABI (Application Binary Interface)**
The ABI is extracted from the compiled contract and used in the frontend:

```javascript
export const AGRICHAIN_ABI = [
  "function registerProduct(string memory _id, string memory _name, uint256 _quantity, uint256 _basePrice, string memory _harvestDate, string memory _quality, string memory _location) public",
  "function updateAsDistributor(string memory _productId, uint256 _handlingCost, string memory _transportDetails) public",
  "function updateAsRetailer(string memory _productId, uint256 _retailMargin, string memory _storeDetails) public",
  "function getProduct(string memory _productId) public view returns (tuple(...))",
  // ... more functions
];
```

### Frontend Integration

#### 1. **Blockchain Service Class**
Located at: `frontendNbackend/src/services/blockchainService.ts`

**Key Features:**
- **Wallet Connection**: Connects to MetaMask
- **Contract Interaction**: Calls smart contract functions
- **Error Handling**: Manages connection issues
- **Network Management**: Handles network switching

#### 2. **Connection Process**
```javascript
// Initialize connection
const blockchainService = new BlockchainService();
await blockchainService.connect();

// Register product
const txHash = await blockchainService.registerProduct(
  productId,
  productName,
  quantity,
  basePrice,
  harvestDate,
  quality,
  location
);
```

#### 3. **Price Management**
- **INR Storage**: Prices stored in smallest INR units (wei equivalent)
- **Decimal Handling**: Configurable decimal places (default: 18)
- **Currency Conversion**: Support for ETH/INR conversion rates
- **Display Formatting**: Automatic formatting for user display

---

## Security & Transparency

### Security Features

#### 1. **Access Control**
- **Modifiers**: Ensure only authorized users can perform actions
- **Status Validation**: Products must be in correct status for updates
- **Unique IDs**: Prevent duplicate product registrations

#### 2. **Data Integrity**
- **Immutable Records**: Once written, data cannot be changed
- **Cryptographic Hashing**: All transactions are cryptographically secured
- **Block Verification**: Each block is verified by network consensus

#### 3. **Transparency**
- **Public Records**: All transactions are visible to everyone
- **Event Logging**: Important actions emit events for tracking
- **Complete History**: Full audit trail for every product

### Trust Mechanisms

#### 1. **Cryptographic Proof**
- **Digital Signatures**: Every transaction is signed by the sender
- **Hash Verification**: Data integrity verified through hashing
- **Blockchain Consensus**: Network agrees on valid transactions

#### 2. **Decentralization**
- **No Single Point of Failure**: Data distributed across network
- **No Central Authority**: No single entity controls the system
- **Network Consensus**: Decisions made by network majority

#### 3. **Audit Trail**
- **Complete History**: Every action is recorded with timestamp
- **Actor Identification**: Each action linked to specific wallet address
- **Block Numbers**: Transactions linked to specific blockchain blocks

---

## Deployment & Network

### Development Environment

#### 1. **Hardhat Network**
- **Purpose**: Local development and testing
- **Chain ID**: 31337
- **RPC URL**: http://localhost:8545
- **Features**: Fast block times, unlimited ETH for testing

#### 2. **MetaMask Configuration**
```
Network Name: AgroChain Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

#### 3. **Test Accounts**
- **Pre-funded**: Each account starts with 10,000 ETH
- **Private Keys**: Available in Hardhat output
- **Multiple Roles**: Different accounts for farmer, distributor, retailer

### Production Deployment

#### 1. **Ethereum Testnet (Sepolia)**
- **Purpose**: Testing with real network conditions
- **Chain ID**: 11155111
- **Features**: Real gas costs, network delays
- **Requirements**: Sepolia ETH for transactions

#### 2. **Mainnet Deployment**
- **Purpose**: Production use with real value
- **Chain ID**: 1
- **Requirements**: Real ETH for gas fees
- **Considerations**: Higher costs, slower transactions

### Network Management

#### 1. **Automatic Network Switching**
```javascript
// Frontend automatically switches to correct network
if (network.chainId !== EXPECTED_CHAIN_ID) {
  await this.requestNetworkSwitch(network.chainId);
}
```

#### 2. **Contract Address Resolution**
```javascript
// Tries multiple known addresses
const candidateAddresses = [
  AGRICHAIN_CONTRACT_ADDRESS,
  '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  '0x0165878A594ca255338adfa4d48449f69242Eb8F'
];
```

---

## Integration with Frontend

### Connection Flow

#### 1. **Wallet Connection**
```javascript
// User clicks "Connect Wallet" button
const connected = await blockchainService.connect();

// System checks for MetaMask
if (typeof window.ethereum !== 'undefined') {
  // Request account access
  const accounts = await window.ethereum.request({ 
    method: 'eth_requestAccounts' 
  });
}
```

#### 2. **Contract Initialization**
```javascript
// Create contract instance
this.contract = new ethers.Contract(
  contractAddress,
  AGRICHAIN_ABI,
  signer
);
```

#### 3. **Transaction Handling**
```javascript
// Register product
const tx = await this.contract.registerProduct(
  productId,
  productName,
  quantity,
  priceInWei,
  harvestDate,
  quality,
  location
);

// Wait for confirmation
await tx.wait();
```

### Error Handling

#### 1. **Connection Errors**
- **MetaMask Not Found**: Prompt user to install MetaMask
- **Wrong Network**: Automatically switch to correct network
- **User Rejection**: Handle user cancellation gracefully

#### 2. **Transaction Errors**
- **Insufficient Gas**: Estimate and set appropriate gas limit
- **Contract Not Found**: Verify contract deployment
- **Invalid Parameters**: Validate input before sending

#### 3. **Network Errors**
- **Connection Timeout**: Retry with exponential backoff
- **Network Congestion**: Show appropriate user messages
- **RPC Errors**: Fallback to alternative RPC endpoints

### User Experience

#### 1. **Loading States**
- **Connection Loading**: Show progress during wallet connection
- **Transaction Pending**: Display transaction hash and status
- **Confirmation Waiting**: Show "Waiting for confirmation" message

#### 2. **Success Feedback**
- **Transaction Success**: Show success message with transaction hash
- **Product Registered**: Display product details and QR code
- **Status Updates**: Real-time updates on product status changes

#### 3. **Error Messages**
- **User-Friendly**: Convert technical errors to readable messages
- **Actionable**: Provide clear next steps for users
- **Contextual**: Show relevant information for troubleshooting

---

## Summary

The blockchain component of KrishiSetu provides:

1. **Immutable Record Keeping**: All product information is permanently stored and cannot be altered
2. **Complete Transparency**: Every step in the supply chain is visible to all participants
3. **Trust Building**: Cryptographic proof ensures authenticity and prevents fraud
4. **Automated Execution**: Smart contracts automatically execute when conditions are met
5. **Decentralized Control**: No single entity controls the system
6. **Cost Efficiency**: Reduces need for intermediaries and paperwork
7. **Real-time Updates**: Instant synchronization across all participants
8. **Audit Trail**: Complete history of all transactions and changes

This blockchain foundation enables a transparent, trustworthy, and efficient agricultural supply chain that benefits all stakeholders from farmers to consumers.
