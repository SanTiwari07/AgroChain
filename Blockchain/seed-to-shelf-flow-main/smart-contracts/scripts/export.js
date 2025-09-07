const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const network = hre.network.name;
  const deployedInfoPath = path.join(__dirname, `../deployed-${network}.json`);
  if (!fs.existsSync(deployedInfoPath)) {
    throw new Error(`Deployment file not found: ${deployedInfoPath}. Run deploy first.`);
  }

  const { address } = JSON.parse(fs.readFileSync(deployedInfoPath, "utf-8"));
  const AgriChain = await hre.ethers.getContractAt("AgriChain", address);

  const allIds = await AgriChain.getAllProductIds();
  const products = [];
  const histories = {};

  for (const id of allIds) {
    const p = await AgriChain.getProduct(id);
    products.push({
      id: p.id,
      name: p.name,
      quantity: Number(p.quantity),
      basePrice: hre.ethers.formatEther(p.basePrice),
      currentPrice: hre.ethers.formatEther(p.currentPrice),
      harvestDate: p.harvestDate,
      quality: p.quality,
      status: p.status,
      farmer: p.farmer,
      distributor: p.distributor,
      retailer: p.retailer,
      location: p.location,
      timestamp: Number(p.timestamp)
    });

    const hist = await AgriChain.getProductHistory(id);
    histories[id] = hist.map(h => ({
      productId: h.productId,
      actor: h.actor,
      action: h.action,
      newPrice: hre.ethers.formatEther(h.newPrice),
      details: h.details,
      timestamp: Number(h.timestamp),
      blockNumber: Number(h.blockNumber)
    }));
  }

  const stats = await AgriChain.getContractStats();
  const output = {
    network,
    contract: address,
    totalProducts: Number(stats[0]),
    totalTransactions: Number(stats[1]),
    totalValueEth: hre.ethers.formatEther(stats[2]),
    activeProducts: Number(stats[3]),
    products,
    histories
  };

  const outPath = path.join(__dirname, `../export-${network}.json`);
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`✅ Exported on-chain data to ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


