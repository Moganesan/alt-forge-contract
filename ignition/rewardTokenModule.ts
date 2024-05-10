import { buildModule } from "@nomicfoundation/ignition-core";
import { parseEther } from "viem";

export default buildModule("TestTokens", (m) => {
  const initialSupply = parseEther("1000000");
  const rewardToken = m.contract("Reward", [initialSupply]);

  return {
    rewardToken,
  };
});
