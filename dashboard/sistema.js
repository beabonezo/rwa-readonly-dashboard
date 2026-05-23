
import {
    createConfig,
    http,
    connect,
    disconnect,
    watchAccount,
    reconnect,
    getAccount,
    switchChain,
    injected
} from 'https://esm.sh/@wagmi/core@2.6.5';
import { mainnet, sepolia } from 'https://esm.sh/@wagmi/core@2.6.5/chains';
import { createPublicClient, formatUnits } from 'https://esm.sh/viem@2.7.1';
// PROJECT_ID vem de config.js (arquivo local NÃO commitado — ver config.example.js).
// MetaMask e Rabby via extensão funcionam sem configuração. WalletConnect requer o ID.
import { PROJECT_ID } from './config.js';

// --- CONFIGURAÇÃO E CONSTANTES ---

const RPC_URL = "https://ethereum-sepolia.publicnode.com";
const CONTRACT_ADDRESS = "0x539543926AC76ba2B61eC28A500241DbaAA688c9"; // Token ERC20 alvo (Sepolia)
const MAX_SUPPLY = 500000000; // Referência para cálculo da barra de progresso (hardcoded)

// ABI parcial v2 (somente leitura)
const TOKEN_ABI = [
    { inputs: [], name: "name", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "symbol", outputs: [{ type: "string" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "decimals", outputs: [{ type: "uint8" }], stateMutability: "view", type: "function" },
    { inputs: [], name: "totalSupply", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" }
];

// 1. Setup do cliente Wagmi (gerenciamento de estado global)
export const config = createConfig({
    chains: [mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        // [SECURITY NOTE] Public nodes have rate limits. Production apps should use Alchemy/Infura.
        [sepolia.id]: http(RPC_URL),
    },
    connectors: [
        injected(),
    ],
})

// 2. Cliente Viem para chamadas RPC diretas (read-only)
const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL)
});

// Referências DOM globais (injetadas no onLoad)
let elConnectBtn;
let elDisconnectBtn;
let elWalletInfo;
let elWalletAddress;
let elNetworkName;

let elName;
let elSymbol;
let elSupply;
let elDecimals;
let elAddress;
let copyBtn;
let copyFeedback;
let elProgressSection;
let elEmissionPercent;
let elProgressBar;


// --- FUNÇÕES DE DASHBOARD (Leitura) ---

async function loadTokenData() {
    console.log("Carregando dados do token via Viem...");

    // Renderiza endereço formatado imediatamente
    if (elAddress) elAddress.textContent = formatAddress(CONTRACT_ADDRESS);

    try {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            publicClient.readContract({ address: CONTRACT_ADDRESS, abi: TOKEN_ABI, functionName: 'name' }).catch(() => "Desconhecido"),
            publicClient.readContract({ address: CONTRACT_ADDRESS, abi: TOKEN_ABI, functionName: 'symbol' }).catch(() => "???"),
            publicClient.readContract({ address: CONTRACT_ADDRESS, abi: TOKEN_ABI, functionName: 'decimals' }).catch(() => 18),
            publicClient.readContract({ address: CONTRACT_ADDRESS, abi: TOKEN_ABI, functionName: 'totalSupply' }).catch(() => 0n)
        ]);

        // Atualização reativa da UI
        if (elName) elName.textContent = name;
        if (elSymbol) elSymbol.textContent = symbol;
        if (elDecimals) elDecimals.textContent = decimals;

        // Converte BigInt (wei) para human-readable
        const formattedSupply = formatUnits(totalSupply, decimals);
        const supplyNumber = parseFloat(formattedSupply);

        if (elSupply) {
            elSupply.textContent = supplyNumber.toLocaleString('pt-BR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        }

        updateProgressBar(supplyNumber);

    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        if (elName) elName.textContent = "Erro de Leitura";
    }
}

function updateProgressBar(currentSupply) {
    if (!elProgressSection) return;

    if (MAX_SUPPLY && MAX_SUPPLY > 0) {
        let percent = (currentSupply / MAX_SUPPLY) * 100;
        if (percent > 100) percent = 100;
        if (percent < 0) percent = 0;

        elProgressSection.style.display = 'block';
        setTimeout(() => {
            if (elEmissionPercent) elEmissionPercent.textContent = percent.toFixed(1) + "%";
            if (elProgressBar) elProgressBar.style.width = percent + "%";
        }, 100);
    } else {
        elProgressSection.style.display = 'none';
    }
}

// --- FUNÇÕES DE WALLET ---

/**
 * Atualiza a UI da wallet com base em dados brutos do MetaMask.
 * @param {string|null} address - Endereço conectado ou null para desconectado.
 */
async function updateWalletUI(address) {
    if (!elConnectBtn || !elWalletInfo) return;

    if (address) {
        // Estado: conectado
        elConnectBtn.style.display = 'none';
        elWalletInfo.style.display = 'flex';

        if (elWalletAddress) elWalletAddress.textContent = formatAddress(address);

        // Busca rede atual
        try {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);
            const chain = config.chains.find(c => c.id === chainId);
            if (elNetworkName) {
                elNetworkName.textContent = chain ? chain.name : 'Rede Desconhecida';
                elNetworkName.style.color = chain ? 'var(--text-secondary)' : 'yellow';
            }
        } catch {
            if (elNetworkName) elNetworkName.textContent = '---';
        }
    } else {
        // Estado: desconectado
        elConnectBtn.style.display = 'block';
        elWalletInfo.style.display = 'none';
        if (elWalletAddress) elWalletAddress.textContent = '';
        if (elNetworkName) elNetworkName.textContent = '';
    }
}

async function handleConnect() {
    if (!window.ethereum) {
        alert('Nenhuma wallet detectada. Instale MetaMask ou Rabby e recarregue a página.');
        return;
    }

    // Feedback visual durante a conexão
    if (elConnectBtn) {
        elConnectBtn.disabled = true;
        elConnectBtn.textContent = 'Conectando...';
    }

    try {
        // eth_requestAccounts abre o popup nativo da MetaMask/Rabby
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Atualiza a UI imediatamente com o endereço retornado
        if (accounts && accounts.length > 0) {
            await updateWalletUI(accounts[0]);
        }
        console.log('[RWA] Wallet conectada:', accounts[0]);
    } catch (error) {
        if (error.code === 4001) {
            // Código 4001 = usuário fechou ou recusou o popup
            console.warn('[RWA] Usuário recusou a conexão com a wallet.');
        } else {
            console.error('[RWA] Erro ao conectar wallet:', error);
            alert('Erro ao conectar: ' + (error.message || 'Tente novamente.'));
        }
    } finally {
        // Restaura o botão independente do resultado
        if (elConnectBtn) {
            elConnectBtn.disabled = false;
            elConnectBtn.textContent = 'Conectar Wallet';
        }
    }
}

async function handleDisconnect() {
    try {
        // Revoga permissões no MetaMask (disponível em versões modernas)
        await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }]
        });
    } catch {
        // Fallback: wallet_revokePermissions pode não estar disponível em todos os providers
    }

    // Desconecta no Wagmi e limpa a UI
    try { await disconnect(config); } catch { /* ignora */ }
    await updateWalletUI(null);
    console.log('[RWA] Wallet desconectada.');
}

// --- UTILITÁRIOS ---

function formatAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Captura de elementos DOM após carregamento
    elConnectBtn    = document.getElementById('connectWalletBtn');
    elDisconnectBtn = document.getElementById('disconnectBtn');
    elWalletInfo    = document.getElementById('walletInfo');
    elWalletAddress = document.getElementById('walletAddress');
    elNetworkName   = document.getElementById('networkName');

    elName           = document.getElementById('tokenName');
    elSymbol         = document.getElementById('tokenSymbol');
    elSupply         = document.getElementById('totalSupply');
    elDecimals       = document.getElementById('decimals');
    elAddress        = document.getElementById('contractAddress');
    copyBtn          = document.getElementById('copyAddressBtn');
    copyFeedback     = document.getElementById('copyFeedback');
    elProgressSection = document.getElementById('progressSection');
    elEmissionPercent = document.getElementById('emissionPercent');
    elProgressBar    = document.getElementById('progressBar');

    // 2. Busca dados on-chain públicos (independe de login)
    loadTokenData();

    // 3. Listeners de interação
    if (elConnectBtn) {
        elConnectBtn.addEventListener('click', handleConnect);
    }

    if (elDisconnectBtn) {
        elDisconnectBtn.addEventListener('click', handleDisconnect);
    }

    // Cópia p/ clipboard com feedback visual
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(CONTRACT_ADDRESS).then(() => {
                if (copyFeedback) {
                    copyFeedback.classList.add('visible');
                    setTimeout(() => copyFeedback.classList.remove('visible'), 2000);
                }
            });
        });
    }

    // 4. Verifica se já existe uma wallet conectada ao carregar a página
    if (window.ethereum) {
        window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
            if (accounts && accounts.length > 0) {
                updateWalletUI(accounts[0]);
            }
        }).catch(() => {});

        // Observa mudanças de conta (troca de conta ou desconexão pelo usuário)
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts && accounts.length > 0) {
                updateWalletUI(accounts[0]);
            } else {
                updateWalletUI(null);
            }
        });

        // Observa mudanças de rede
        window.ethereum.on('chainChanged', () => {
            // Ao trocar de rede, re-lê a conta atual para atualizar o badge de rede
            window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
                if (accounts && accounts.length > 0) updateWalletUI(accounts[0]);
            }).catch(() => {});
        });
    }
});
