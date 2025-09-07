const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying AgriChain Smart Contract...");
  console.log("=====================================");
  
  // Get the contract factory
  const AgriChain = await hre.ethers.getContractFactory("AgriChain");
  
  // Deploy the contract
  console.log("📦 Deploying contract...");
  const agriChain = await AgriChain.deploy();
  
  // Wait for deployment to be mined
  await agriChain.waitForDeployment();
  
  const contractAddress = await agriChain.getAddress();
  console.log(`✅ AgriChain deployed successfully!`);
  console.log(`📍 Contract Address: ${contractAddress}`);
  console.log(`🔗 Network: ${hre.network.name}`);
  try {
    const outPath = path.join(__dirname, "../deployed-" + hre.network.name + ".json");
    fs.writeFileSync(
      outPath,
      JSON.stringify({ address: contractAddress, network: hre.network.name, artifact: "artifacts/contracts/AgriChain.sol/AgriChain.json" }, null, 2)
    );
    console.log(`📝 Saved deployment info to: ${outPath}`);
  } catch (e) {
    console.warn("Could not write deployment file:", e.message);
  }
  
  // Get deployment transaction details
  const deploymentTx = agriChain.deploymentTransaction();
  if (deploymentTx) {
    console.log(`💸 Deployment Transaction Hash: ${deploymentTx.hash}`);
    console.log(`⛽ Gas Used: ${deploymentTx.gasLimit?.toString()}`);
  }
  
  console.log("\n🌾 Registering sample products for demo...");
  console.log("==========================================");
  
  // Register sample products to demonstrate functionality
  const sampleProducts = [
    {
      id: "AGRI-DEMO-001",
      name: "Premium Basmati Rice",
      quantity: 500,
      basePrice: hre.ethers.parseEther("0.025"), // 0.025 ETH per kg
      harvestDate: "2024-08-15",
      quality: "A",
      location: "Punjab, India"
    },
    {
      id: "AGRI-DEMO-002", 
      name: "Organic Wheat",
      quantity: 300,
      basePrice: hre.ethers.parseEther("0.020"), // 0.020 ETH per kg
      harvestDate: "2024-08-20",
      quality: "A",
      location: "Haryana, India"
    },
    {
      id: "AGRI-DEMO-003",
      name: "Fresh Corn",
      quantity: 200,
      basePrice: hre.ethers.parseEther("0.018"), // 0.018 ETH per kg
      harvestDate: "2024-08-25",
      quality: "B",
      location: "Gujarat, India"
    }
  ];
  
  // Register each sample product
  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    
    try {
      console.log(`\n📝 Registering: ${product.name}`);
      const tx = await agriChain.registerProduct(
        product.id,
        product.name,
        product.quantity,
        product.basePrice,
        product.harvestDate,
        product.quality,
        product.location
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log(`   ✅ Registered successfully!`);
      console.log(`   🏷️  Product ID: ${product.id}`);
      console.log(`   📊 Transaction Hash: ${receipt.hash}`);
      console.log(`   ⛽ Gas Used: ${receipt.gasUsed?.toString()}`);
    } catch (error) {
      console.log(`   ❌ Failed to register ${product.name}:`, error.message);
    }
  }
  
  // Demonstrate supply chain updates
  console.log("\n🚛 Simulating supply chain updates...");
  console.log("====================================");
  
  try {
    // Simulate distributor updating first product
    console.log("\n📦 Distributor taking first product...");
    const distributorTx = await agriChain.updateAsDistributor(
      "AGRI-DEMO-001",
      hre.ethers.parseEther("0.005"), // 0.005 ETH handling cost
      "Truck ID: PB-01-1234, Driver: Ravi Kumar, Route: Punjab to Delhi"
    );
    
    const distributorReceipt = await distributorTx.wait();
    console.log(`   ✅ Transportation started!`);
    console.log(`   📊 Transaction Hash: ${distributorReceipt.hash}`);
    
    // Simulate retailer updating the product
    console.log("\n🏪 Retailer adding product to store...");
    const retailerTx = await agriChain.updateAsRetailer(
      "AGRI-DEMO-001",
      hre.ethers.parseEther("0.010"), // 0.010 ETH retail margin
      "FreshMart Delhi, Cold Storage, 30-day shelf life"
    );
    
    const retailerReceipt = await retailerTx.wait();
    console.log(`   ✅ Product added to store!`);
    console.log(`   📊 Transaction Hash: ${retailerReceipt.hash}`);
    
  } catch (error) {
    console.log(`   ❌ Supply chain update failed:`, error.message);
  }
  
  // Get final contract statistics
  console.log("\n📈 Final Contract Statistics");
  console.log("============================");
  
  try {
    const stats = await agriChain.getContractStats();
    console.log(`📦 Total Products: ${stats[0]}`);
    console.log(`💳 Total Transactions: ${stats[1]}`);
    console.log(`💰 Total Value: ${hre.ethers.formatEther(stats[2])} ETH`);
    console.log(`🔄 Active Products: ${stats[3]}`);
  } catch (error) {
    console.log("Failed to get contract stats:", error.message);
  }
  
  console.log("\n🎉 Deployment and Demo Setup Complete!");
  console.log("=====================================");
  console.log(`📋 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${hre.network.name}`);
  console.log("🔍 You can now interact with the contract using the frontend!");
  console.log("\n📚 Next Steps:");
  console.log("   1. Copy the contract address to your frontend configuration");
  console.log("   2. Update the ABI in your frontend with the compiled artifacts");
  console.log("   3. Connect MetaMask to the same network");
  console.log("   4. Start demonstrating the supply chain transparency!");
  
  // Output contract ABI location
  console.log(`\n📁 Contract ABI available at: artifacts/contracts/AgriChain.sol/AgriChain.json`);
  
  return contractAddress;
}

// Error handling
main()
  .then((contractAddress) => {
    console.log(`\n✨ Deployment successful! Contract Address: ${contractAddress}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Deployment failed:");
    console.error(error);
    process.exit(1);
  });


