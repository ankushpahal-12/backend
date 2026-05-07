import dotenv from 'dotenv';
dotenv.config();

/**
 * Web3 Network Configuration for Backend Operations
 * 
 * Provides details about supported EVM-compatible networks, their standard RPC endpoints,
 * and environment variable overrides for authenticated RPC providers (e.g., Alchemy, Infura).
 */
export const web3Config = {
    networks: {
        // Ethereum Mainnet
        1: {
            name: 'Ethereum Mainnet',
            rpcUrl: process.env.ETH_MAINNET_RPC_URL || 'https://eth.llamarpc.com',
            explorerUrl: 'https://etherscan.io',
        },
        // Polygon PoS
        137: {
            name: 'Polygon Mainnet',
            rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
            explorerUrl: 'https://polygonscan.com',
        },
        56: {
            name: 'BNB Smart Chain Mainnet',
            rpcUrl: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org/',
            explorerUrl: 'https://bscscan.com',
        },
        8453: {
            name: 'Base',
            rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
            explorerUrl: 'https://basescan.org',
        },
        11155111: {
            name: 'Sepolia Testnet',
            rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc2.sepolia.org',
            explorerUrl: 'https://sepolia.etherscan.io',
        }
    },
    defaultChainId: process.env.DEFAULT_CHAIN_ID ? parseInt(process.env.DEFAULT_CHAIN_ID, 10) : 1,
};
export const getRpcUrl = (chainId) => {
    const network = web3Config.networks[chainId];
    if (!network) {
        throw new Error(`Unsupported network configuration for chain ID: ${chainId}`);
    }
    return network.rpcUrl;
};

export default web3Config;
