import { buildModule } from "@nomicfoundation/ignition-core";

export default buildModule("TestTokens", (m) => {
  const investToken = m.contract("USDT");

  return {
    investToken,
  };
});
