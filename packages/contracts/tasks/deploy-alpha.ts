import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance));

  // ── 1. Deploy AlphaPaymentHub ─────────────────────────────────
  console.log("\n--- Deploying AlphaPaymentHub ---");

  const AlphaPaymentHub = await ethers.getContractFactory("AlphaPaymentHub");

  // Deploy implementation
  const hubImpl = await AlphaPaymentHub.deploy();
  await hubImpl.waitForDeployment();
  const hubImplAddress = await hubImpl.getAddress();
  console.log("AlphaPaymentHub implementation:", hubImplAddress);

  // Encode initialize call
  const initData = AlphaPaymentHub.interface.encodeFunctionData("initialize", [
    USDC_ADDRESS,
  ]);

  // Deploy ERC1967Proxy inline using its bytecode from OZ artifacts
  const proxyArtifact = await ethers.getContractFactory(
    "ERC1967Proxy",
    deployer
  );
  const proxy = await proxyArtifact.deploy(hubImplAddress, initData);
  await proxy.waitForDeployment();
  const hubProxyAddress = await proxy.getAddress();
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
    chainId: 5042002,
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
