import { buildModule } from "@nomicfoundation/ignition-core";

export default buildModule("TestTokens", (m) => {
  const rewardToken = m.contract("Reward");

  return {
    rewardToken,
  };
});
