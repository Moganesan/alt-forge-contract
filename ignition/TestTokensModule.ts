import { buildModule } from "@nomicfoundation/ignition-core";

export default buildModule("TestTokens", (m) => {
  const nativeToken = m.contract("Native");

  const rewardToken = m.contract("Reward");

  return {
    nativeToken,
    rewardToken,
  };
});
