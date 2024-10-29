import { ethers } from 'ethers';
import { CheckEtherScanResult, ResultStatus } from '../models/models';

// Map of network names to RPC URLs
const networkRpcMap: { [key: string]: string } = {
    mainnet: "https://eth-mainnet.g.alchemy.com/v2/",
    holesky: "https://eth-holesky.g.alchemy.com/v2/",
    sepolia: "https://eth-sepolia.g.alchemy.com/v2/"
};

async function checkTransaction(
    network: string,
    txHash: string,
    expectedVerificationHash: string,
    alchemyKey: string
): Promise<CheckEtherScanResult> {
    let result: CheckEtherScanResult = {
        verificationHashMatches: false,
        message: "",
        successful: false
    };

    try {
        const rpcUrl = networkRpcMap[network] + alchemyKey;
        if (!rpcUrl) throw new Error(`Unsupported network: ${network}`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);

        const tx = await provider.getTransaction(txHash);

        if (!tx) {
            result.message = "Transaction not found";
            return result;
        }

        const inputData = tx.data;
        const functionSelector = "0x9cef4ea1";

        if (inputData.startsWith(functionSelector)) {
            const actualVerificationHash = inputData.slice(10, 10 + 128);
            const hashMatches = actualVerificationHash.toLowerCase() === expectedVerificationHash.toLowerCase();

            result.verificationHashMatches = hashMatches;
            result.successful = hashMatches;
            result.message = hashMatches ? "Verification hash matches" : "Verification hash does not match";
        } else {
            result.message = "Transaction data does not contain expected function selector";
        }

        return result;

    } catch (error: any) {
        console.error("Error during transaction verification:", error);
        result.message = `An error occurred: ${error.message || error}`;
        return result;
    }
}


export { checkTransaction };