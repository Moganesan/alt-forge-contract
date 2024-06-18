import { parseEther } from "viem";
import hre from "hardhat";

async function main() {
  const wallet: any = await hre.viem.getWalletClient(
    "0x17206eE0F5F452cc9EA68374e2fe7BC62400c3A1"
  );
  const USDT = await hre.viem.deployContract("USDT", [parseEther("1000000")], {
    client: wallet,
  });

  console.log("USDT Contract", USDT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
