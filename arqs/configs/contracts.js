// contracts.js — Fonte única de verdade para rede + contrato (READ-ONLY)
// Versão JavaScript do arquivo de referência (contracts.ts foi descontinuado)

export const NETWORK = {
  name: 'sepolia',
  chainId: 11155111,
  rpcUrl: 'https://ethereum-sepolia.publicnode.com',
};

export const CONTRACTS = {
  rwaToken: {
    name: 'RWA Token (didático)',
    address: '0x539543926AC76ba2B61eC28A500241DbaAA688c9',
    abiPath: '/arqs/abi/abitoken.json',
  },
};
