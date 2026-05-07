export interface NetworkConfig {
    chainId: number;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
    iconUrl?: string; // Optional icon for the network
}

export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
    // Ethereum Mainnet
    1: {
        chainId: 1,
        chainName: 'Ethereum Mainnet',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://mainnet.infura.io/v3/YOUR_INFURA_KEY', 'https://eth-mainnet.public.blastapi.io'],
        blockExplorerUrls: ['https://etherscan.io'],
    },
    // Polygon PoS
    137: {
        chainId: 137,
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
        },
        rpcUrls: ['https://polygon-rpc.com', 'https://rpc-mainnet.maticvigil.com'],
        blockExplorerUrls: ['https://polygonscan.com'],
    },
    // BNB Smart Chain
    56: {
        chainId: 56,
        chainName: 'BNB Smart Chain Mainnet',
        nativeCurrency: {
            name: 'BNB',
            symbol: 'BNB',
            decimals: 18,
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/', 'https://bsc-dataseed1.defibit.io/'],
        blockExplorerUrls: ['https://bscscan.com'],
    },
    // Base
    8453: {
        chainId: 8453,
        chainName: 'Base',
        nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://mainnet.base.org', 'https://base.publicnode.com'],
        blockExplorerUrls: ['https://basescan.org'],
    },
    // Sepolia Testnet
    11155111: {
        chainId: 11155111,
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
            name: 'Sepolia Ether',
            symbol: 'ETH',
            decimals: 18,
        },
        rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
    }
};

export const DEFAULT_CHAIN_ID = 1; // Default to Ethereum Mainnet

/**
 * Gets the network configuration for a given chain ID.
 * @param chainId The chain ID to look up.
 * @returns The network configuration or undefined if not supported.
 */
export const getNetworkConfig = (chainId: number): NetworkConfig | undefined => {
    return SUPPORTED_NETWORKS[chainId];
};

/**
 * Formats a network configuration into the format expected by MetaMask/Web3 wallets
 * for the `wallet_addEthereumChain` RPC call.
 * @param chainId The chain ID to format.
 */
export const getAddChainParameters = (chainId: number) => {
    const config = SUPPORTED_NETWORKS[chainId];
    if (!config) return null;

    return {
        chainId: `0x${config.chainId.toString(16)}`,
        chainName: config.chainName,
        nativeCurrency: config.nativeCurrency,
        rpcUrls: config.rpcUrls,
        blockExplorerUrls: config.blockExplorerUrls,
    };
};
