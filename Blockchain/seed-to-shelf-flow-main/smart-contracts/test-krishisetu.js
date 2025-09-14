const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing KrishiSetu Contract...");
  console.log("=================================");
  
  // Get the deployed contract
  const KrishiSetu = await hre.ethers.getContractFactory("KrishiSetu");
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // From deployment
  const krishiSetu = KrishiSetu.attach(contractAddress);
  
  console.log(`📋 Contract Address: ${contractAddress}`);
  
  // Test 1: Get contract statistics
  console.log("\n📊 Contract Statistics:");
  try {
    const stats = await krishiSetu.getContractStats();
    console.log(`   Total Products: ${stats[0]}`);
    console.log(`   Total Transactions: ${stats[1]}`);
    console.log(`   Total Value: ${hre.ethers.formatEther(stats[2])} ETH`);
    console.log(`   Active Products: ${stats[3]}`);
  } catch (error) {
    console.log(`   ❌ Failed to get stats: ${error.message}`);
  }
  
  // Test 2: Get all product IDs
  console.log("\n📦 All Product IDs:");
  try {
    const productIds = await krishiSetu.getAllProductIds();
    console.log(`   Found ${productIds.length} products:`);
    productIds.forEach((id, index) => {
      console.log(`   ${index + 1}. ${id}`);
    });
  } catch (error) {
    console.log(`   ❌ Failed to get product IDs: ${error.message}`);
  }
  
  // Test 3: Get details of first product
  if (productIds && productIds.length > 0) {
    console.log(`\n🔍 Product Details for ${productIds[0]}:`);
    try {
      const product = await krishiSetu.getProduct(productIds[0]);
      console.log(`   Name: ${product[1]}`);
      console.log(`   Quantity: ${product[2]} kg`);
      console.log(`   Base Price: ${hre.ethers.formatEther(product[3])} ETH`);
      console.log(`   Current Price: ${hre.ethers.formatEther(product[4])} ETH`);
      console.log(`   Quality: ${product[6]}`);
      console.log(`   Status: ${product[7]}`);
      console.log(`   Location: ${product[11]}`);
    } catch (error) {
      console.log(`   ❌ Failed to get product details: ${error.message}`);
    }
    
    // Test 4: Get transaction history
    console.log(`\n📜 Transaction History for ${productIds[0]}:`);
    try {
      const history = await krishiSetu.getProductHistory(productIds[0]);
      console.log(`   Found ${history.length} transactions:`);
      history.forEach((tx, index) => {
        console.log(`   ${index + 1}. ${tx[2]} by ${tx[1]} at ${new Date(Number(tx[5]) * 1000).toLocaleString()}`);
        console.log(`      Price: ${hre.ethers.formatEther(tx[3])} ETH`);
        console.log(`      Details: ${tx[4]}`);
      });
    } catch (error) {
      console.log(`   ❌ Failed to get transaction history: ${error.message}`);
    }
  }
  
  console.log("\n✅ KrishiSetu Contract Test Complete!");
  console.log("=====================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
