
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

// --- CONFIGURAÇÃO E CONSTANTES ---
// [SECURITY WARNING] Project ID is a placeholder. 
// WalletConnect (QR Code) will fail, but Injected wallets (MetaMask) work safely.
const PROJECT_ID = 'YOUR_PROJECT_ID'; // TODO: Replace with valid ID for WC support
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

// --- FUNÇÕES DE WALLET (Wagmi) ---

function updateWalletUI(account) {
    if (!elConnectBtn || !elWalletInfo) return;

    if (account.isConnected && account.address) {
        elConnectBtn.style.display = 'none';
        elWalletInfo.style.display = 'flex';
        if (elWalletAddress) elWalletAddress.textContent = formatAddress(account.address);

        // Feedback visual da chain conectada
        const chainId = account.chainId;
        const chain = config.chains.find(c => c.id === chainId);

        if (elNetworkName) {
            if (chain) {
                elNetworkName.textContent = chain.name;
                elNetworkName.style.color = 'var(--text-secondary)';
            } else {
                elNetworkName.textContent = "Rede Desconhecida";
                elNetworkName.style.color = "yellow";
            }
        }

    } else {
        elConnectBtn.style.display = 'block';
        elWalletInfo.style.display = 'none';
        if (elWalletAddress) elWalletAddress.textContent = '';
        if (elNetworkName) elNetworkName.textContent = '';
    }
}

async function handleConnect() {
    console.log("CONNECT CLICK - Iniciando");

    if (!window.ethereum) {
        alert("Nenhuma wallet detectada (MetaMask/Rabby). Abra no Chrome com extensão habilitada.");
        return;
    }

    try {
        console.log("Tentando conectar via Wagmi...");
        // Conexão primária via Connector Injetado
        await connect(config, { connector: injected() });
    } catch (error) {
        console.error("Erro Wagmi (Tentando Fallback):", error);
        // NOTE: Silencia erro do conector Wagmi para tentar fallback nativo (window.ethereum)

        try {
            console.log("Tentando Fallback: window.ethereum.request...");
            await window.ethereum.request({ method: "eth_requestAccounts" });
            // Sucesso no fallback dispara hooks do Wagmi (watchAccount) automaticamente
        } catch (fallbackError) {
            console.error("Erro Fallback:", fallbackError);
            alert("Erro ao conectar: " + (fallbackError.message || fallbackError));
        }
    }
}

// --- UTILITÁRIOS ---

function formatAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// --- INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Captura de elementos DOM após carregamento
    elConnectBtn = document.getElementById('connectWalletBtn');
    elWalletInfo = document.getElementById('walletInfo');
    elWalletAddress = document.getElementById('walletAddress');
    elNetworkName = document.getElementById('networkName');

    elName = document.getElementById('tokenName');
    elSymbol = document.getElementById('tokenSymbol');
    elSupply = document.getElementById('totalSupply');
    elDecimals = document.getElementById('decimals');
    elAddress = document.getElementById('contractAddress');
    copyBtn = document.getElementById('copyAddressBtn');
    copyFeedback = document.getElementById('copyFeedback');
    elProgressSection = document.getElementById('progressSection');
    elEmissionPercent = document.getElementById('emissionPercent');
    elProgressBar = document.getElementById('progressBar');

    // 2. Busca dados on-chain públicos (independe de login)
    loadTokenData();

    // 3. Listeners de interação
    if (elConnectBtn) {
        elConnectBtn.addEventListener('click', handleConnect);
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

    // 4. Restauração de sessão e observadores de estado
    reconnect(config);

    watchAccount(config, {
        onChange(account) {
            updateWalletUI(account);
        },
    });
});
