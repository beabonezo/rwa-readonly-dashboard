# RWA Readonly Dashboard

Dashboard de leitura pública de ativo do mundo real (RWA) tokenizado na rede **Ethereum Sepolia**.  
Construído com HTML, CSS e JavaScript puro utilizando **Wagmi v2** e **Viem** via CDN (esm.sh).

---

## 🎯 Propósito

Exibir dados on-chain de um token ERC-20 representando um ativo do mundo real (RWA):
- Nome e símbolo do token
- Total emitido (supply formatado)
- Decimais do contrato
- Endereço do contrato (com cópia para clipboard)
- Barra de progresso de emissão vs. supply máximo
- Conexão opcional de wallet (MetaMask / Rabby)

**Modo de operação**: somente leitura — sem transações, sem assinaturas.

---

## 🗂️ Estrutura

```
rwa-readonly-dashboard/
├── dashboard/                # Frontend estático (servido via HTTP)
│   ├── index.html            # Estrutura e SEO
│   ├── styles.css            # Design system (CSS variables, glassmorphism)
│   ├── sistema.js            # Lógica Web3 (Wagmi + Viem)
│   ├── config.js             # ⚠️ NÃO commitado — criar a partir de config.example.js
│   └── config.example.js     # Template de configuração local
├── agent/
│   └── skills/               # Skills do agente de desenvolvimento
│       ├── skill-cleaner/    # Agente de limpeza de código
│       ├── skill-frontend/   # Guia de design e frontend
│       └── skill-web3/       # Revisor de segurança Web3
├── arqs/
│   ├── abi/
│   │   └── abitoken.json     # ABI completo do contrato ERC-20
│   ├── configs/
│   │   ├── contracts.js      # Configuração de rede e endereços (JS)
│   │   └── contracts.ts      # [Legado] Versão TypeScript — use contracts.js
│   ├── historico/
│   │   └── decisisons.md     # Registro de decisões técnicas
│   └── readme/
│       └── README.md         # Este arquivo
└── .gitignore
```

---

## 🚀 Como rodar localmente

Este projeto é um frontend estático que **requer um servidor HTTP** (não funciona via `file://` por usar ES Modules).

```bash
# Opção 1 — Python (sem dependências)
python3 -m http.server 3500 --directory dashboard/

# Opção 2 — Node.js (npx serve)
npx serve dashboard/ -p 3500
```

Acesse: **http://localhost:3500**

---

## ⚙️ Configuração

### WalletConnect (QR Code)

A conexão via MetaMask/Rabby pelo browser funciona **sem configuração adicional**.

Para habilitar o WalletConnect (QR Code):

1. Crie um Project ID gratuito em [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Copie `dashboard/config.example.js` para `dashboard/config.js`
3. Substitua `SEU_PROJECT_ID_AQUI` pelo ID real

> ⚠️ `config.js` está no `.gitignore` — nunca commite este arquivo.

---

## 🔗 Contrato Alvo

| Campo | Valor |
|---|---|
| Rede | Ethereum Sepolia (testnet) |
| Endereço | `0x539543926AC76ba2B61eC28A500241DbaAA688c9` |
| RPC | `https://ethereum-sepolia.publicnode.com` |
| Supply Máximo | 500.000.000 (referência para a barra de progresso) |

---

## 🛡️ Segurança

- Nenhuma chave privada é armazenada ou transmitida
- Todas as operações são **read-only** (view functions)
- CSP (Content-Security-Policy) configurado no HTML
- RPC público com rate limits — para produção, use Alchemy ou Infura

---

## 📋 Decisões Técnicas

Consulte `arqs/historico/decisisons.md` para o histórico completo de decisões de arquitetura.

---

*Beatriz Aguiar — Dashboard RWA — Read Only*
