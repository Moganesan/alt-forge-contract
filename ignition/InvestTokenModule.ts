import {
  NamedArtifactContractDeploymentFuture,
  buildModule,
} from "@nomicfoundation/ignition-core";

export default buildModule("InvestToken", (m) => {
  const investToken: NamedArtifactContractDeploymentFuture<"USDT"> = m.contract(
    "USDT",
    [m.getParameter("initialSupply")]
  );

  return {
    investToken,
  };
});
