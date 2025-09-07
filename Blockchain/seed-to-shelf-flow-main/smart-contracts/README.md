# 🌾 AgriChain Smart Contracts

**Blockchain-powered Agricultural Supply Chain Transparency Platform**

Built for SIH (Smart India Hackathon) - A complete solution for tracking agricultural produce from farmer to consumer using immutable blockchain records.

## 🎯 Problem Statement

Track agricultural produce through the complete supply chain (Farmer → Distributor → Retailer → Consumer) with:
- ✅ Complete transparency (price, origin, quality)
- ✅ Tamper-proof blockchain records
- ✅ Step-by-step verification from each stakeholder
- ✅ Consumer authentication system

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask wallet
- Git

### Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd agrichain-smart-contracts

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### Local Development

```bash
# Start local blockchain
npm run node

# In another terminal, compile contracts
npm run compile

# Deploy to local network
npm run deploy:local

# Run tests
npm test
```

## 📋 Smart Contract Features

### Core Functionality

#### 1. **Product Registration** (Farmer)
```solidity
function registerProduct(
    string memory _id,           // Unique product ID
    string memory _name,         // Product name (e.g., "Wheat")
    uint256 _quantity,          // Quantity in kg
    uint256 _basePrice,         // Base price per kg
    string memory _harvestDate, // Harvest date
    string memory _quality,     // Quality grade (A/B/C)
    string memory _location     // Farm location
) public
```

#### 2. **Distribution Update** (Distributor)
```solidity
function updateAsDistributor(
    string memory _productId,
    uint256 _handlingCost,      // Additional transport cost
    string memory _transportDetails // Truck ID, driver, route
) public
```

#### 3. **Retail Update** (Retailer)
```solidity
function updateAsRetailer(
    string memory _productId,
    uint256 _retailMargin,      // Retail margin added
    string memory _storeDetails // Store address, conditions
) public
```

#### 4. **Product Verification** (Consumer)
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

### Advanced Features

- **Complete Chain of Custody**: Every transaction recorded with timestamps
- **Multi-role Access Control**: Different permissions for each stakeholder
- **Gas Optimization**: Efficient storage and computation
- **Event Logging**: Comprehensive event system for frontend integration
- **Statistics & Analytics**: Built-in contract statistics

## 🔧 Contract Architecture

```
AgriChain.sol
├── Structs
│   ├── Product (complete product information)
│   └── Transaction (transaction history)
├── Mappings
│   ├── products (productId => Product)
│   ├── productHistory (productId => Transaction[])
│   └── role-based product tracking
├── Core Functions
│   ├── registerProduct()
│   ├── updateAsDistributor()
│   ├── updateAsRetailer()
│   └── verifyProduct()
└── View Functions
    ├── getProduct()
    ├── getProductHistory()
    └── getContractStats()
```

## 🌐 Deployment Networks

### Local Development
```bash
npm run deploy:local
```

### Ethereum Sepolia Testnet
```bash
# Set environment variables in .env
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key

npm run deploy:sepolia
```

### Production (Ethereum Mainnet)
```bash
# Set mainnet configuration in .env
npm run deploy:mainnet
```

## 📊 Demo Data

The deployment script automatically creates sample products:

1. **Premium Basmati Rice** (Grade A, 500 kg, Punjab)
2. **Organic Wheat** (Grade A, 300 kg, Haryana)  
3. **Fresh Corn** (Grade B, 200 kg, Gujarat)

Plus demonstrates the complete supply chain flow with sample transactions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage report
npm run coverage

# Test specific functionality
npx hardhat test test/AgriChain.test.js
```

## 📈 Gas Optimization

- **Product Registration**: ~150,000 gas
- **Distribution Update**: ~80,000 gas
- **Retail Update**: ~75,000 gas
- **Product Verification**: View function (no gas)

## 🔍 Contract Verification

After deployment on testnet/mainnet:

```bash
# Verify on Etherscan
npm run verify:sepolia <contract-address>
```

## 📱 Frontend Integration

### Contract Address & ABI
After deployment, you'll get:
- **Contract Address**: Use in your frontend configuration
- **ABI**: Available in `artifacts/contracts/AgriChain.sol/AgriChain.json`

### Sample Frontend Integration
```javascript
import { ethers } from 'ethers';
import AgriChainABI from './AgriChain.json';

const CONTRACT_ADDRESS = "your-deployed-contract-address";
const provider = new ethers.BrowserProvider(window.ethereum);
const contract = new ethers.Contract(CONTRACT_ADDRESS, AgriChainABI.abi, provider);

// Register product
await contract.registerProduct(id, name, quantity, price, date, quality, location);

// Verify product
const verification = await contract.verifyProduct(productId);
```

## 🎯 SIH Demo Script

### For Judges Presentation:

1. **Show Smart Contract Code**
   ```bash
   # Display contract structure
   cat contracts/AgriChain.sol
   ```

2. **Deploy & Test Live**
   ```bash
   # Start local blockchain
   npm run node
   
   # Deploy contract
   npm run deploy:local
   ```

3. **Demonstrate Each Role**
   - Farmer: Register products
   - Distributor: Add transport costs
   - Retailer: Add retail margins
   - Consumer: Verify complete chain

4. **Show Blockchain Transparency**
   - Every transaction is immutable
   - Complete audit trail
   - Cryptographic verification

## 🤝 Team & Development

**Built for Smart India Hackathon**
- **Problem**: Agricultural supply chain transparency
- **Solution**: Blockchain-based tracking system
- **Technology**: Ethereum, Solidity, Hardhat
- **Frontend**: React + Web3 integration

## 📄 License

MIT License - Open source for educational and commercial use.

## 🆘 Support

For SIH demonstration or development questions:
- Review the demo deployment script
- Check the comprehensive test suite
- Use the provided sample data
- Follow the step-by-step deployment guide

---

**🌟 Ready to demonstrate blockchain agricultural transparency to your judges!**