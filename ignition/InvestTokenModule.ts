import {
  NamedArtifactContractDeploymentFuture,
  buildModule,
} from "@nomicfoundation/ignition-core";
import { parseEther } from "viem";

export default buildModule("TestTokens", (m) => {
  const investToken: NamedArtifactContractDeploymentFuture<"USDT"> = m.contract(
    "USDT",
    [m.getParameter("initialSupply")]
  );

  return {
    investToken,
  };
});
