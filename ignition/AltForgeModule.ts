import { buildModule } from "@nomicfoundation/ignition-core";
import { ignition } from "hardhat";
export default buildModule("AltForge", (m) => {
  const altForge = m.contract("AltForge");

  const investToken = m.contract("USDT");
  const rewardToken = m.contract("Reward");

  return {
    altForge,
  };
});
