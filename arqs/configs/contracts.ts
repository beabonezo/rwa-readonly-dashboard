// src/config/contracts.ts
// Fonte única de verdade para rede + contrato (READ-ONLY)

export const NETWORK = {
  name: "sepolia",
  chainId: 11155111,
  rpcUrl: "https://ethereum-sepolia.publicnode.com",
} as const;

export const CONTRACTS = {
  rwaToken: {
    name: "RWA Token (didático)",
    address: "0x539543926AC76ba2B61eC28A500241DbaAA688c9",
    abiPath: "/src/abi/RWAToken.json",
  },
} as const;
