import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // ── 1. Deploy AlphaPaymentHub (UUPS proxy) ────────────────────
  console.log("\n--- Deploying AlphaPaymentHub ---");

  const AlphaPaymentHub = await ethers.getContractFactory("AlphaPaymentHub");
  const hubImpl = await AlphaPaymentHub.deploy();
  await hubImpl.waitForDeployment();
  const hubImplAddress = await hubImpl.getAddress();
  console.log("AlphaPaymentHub implementation:", hubImplAddress);

  // Encode initialize(address _usdc)
  const initData = AlphaPaymentHub.interface.encodeFunctionData("initialize", [
    USDC_ADDRESS,
  ]);

  // Deploy ERC1967Proxy
  const ERC1967Proxy = await ethers.getContractFactory(
    "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy"
  );
  const hubProxy = await ERC1967Proxy.deploy(hubImplAddress, initData);
  await hubProxy.waitForDeployment();
  const hubProxyAddress = await hubProxy.getAddress();
  console.log("AlphaPaymentHub proxy:", hubProxyAddress);

  // ── 2. Deploy AlphaAgentRegistry ──────────────────────────────
  console.log("\n--- Deploying AlphaAgentRegistry ---");

  const AlphaAgentRegistry = await ethers.getContractFactory(
    "AlphaAgentRegistry"
  );
  const registry = await AlphaAgentRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("AlphaAgentRegistry:", registryAddress);

  // ── 3. Save deployment addresses ──────────────────────────────
  const deployment = {
    network: "arcTestnet",
    chainId: 65536,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AlphaPaymentHub: {
        proxy: hubProxyAddress,
        implementation: hubImplAddress,
      },
      AlphaAgentRegistry: {
        address: registryAddress,
      },
    },
    tokens: {
      USDC: USDC_ADDRESS,
    },
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const outPath = path.join(deploymentsDir, "arc-testnet.json");
  fs.writeFileSync(outPath, JSON.stringify(deployment, null, 2));
  console.log("\nDeployment saved to:", outPath);

  console.log("\n✅ All contracts deployed successfully!");
  console.log(JSON.stringify(deployment, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
