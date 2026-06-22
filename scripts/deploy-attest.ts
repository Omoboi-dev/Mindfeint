/**
 * Compiles + deploys MindfeintLog to 0G Chain (Galileo, 16602).
 * Run: npm run deploy:attest   → prints the address to put in .env as ATTEST_ADDRESS
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { ethers } from "ethers";

const require = createRequire(import.meta.url);
const solc = require("solc");

const RPC = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";

function compile() {
  const source = readFileSync("contracts/MindfeintLog.sol", "utf8");
  const input = {
    language: "Solidity",
    sources: { "MindfeintLog.sol": { content: source } },
    settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
  };
  const out = JSON.parse(solc.compile(JSON.stringify(input)));
  const fatal = (out.errors ?? []).filter((e: any) => e.severity === "error");
  if (fatal.length) {
    fatal.forEach((e: any) => console.error(e.formattedMessage));
    throw new Error("Solidity compile failed");
  }
  const c = out.contracts["MindfeintLog.sol"]["MindfeintLog"];
  return { abi: c.abi, bytecode: "0x" + c.evm.bytecode.object };
}

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY required in .env");
  const { abi, bytecode } = compile();
  const provider = new ethers.JsonRpcProvider(RPC);
  const wallet = new ethers.Wallet(pk, provider);
  console.log("→ Deploying MindfeintLog from", wallet.address);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const c = await factory.deploy();
  await c.waitForDeployment();
  const addr = await c.getAddress();

  console.log("\n✅ MindfeintLog deployed:", addr);
  console.log("   explorer: https://chainscan-galileo.0g.ai/address/" + addr);
  console.log("\n   Add this line to .env:\n   ATTEST_ADDRESS=" + addr + "\n");
  process.exit(0);
}

main().catch((e) => {
  console.error("✗ deploy failed:", e?.message ?? e);
  process.exit(1);
});
