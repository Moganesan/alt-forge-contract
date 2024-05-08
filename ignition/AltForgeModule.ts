import { buildModule } from "@nomicfoundation/ignition-core";

export default buildModule("AltForge", (m) => {
  const altForge = m.contract("AltForge");
  return {
    altForge,
  };
});
