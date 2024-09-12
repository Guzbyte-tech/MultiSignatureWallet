import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GTKModule = buildModule("GTKModule", (m) => {
  
  const gtkToken = m.contract("GTK");

  return { gtkToken };
});

export default GTKModule;