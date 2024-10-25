import { CheckEtherScanResult } from "./models";
declare const witnessNetworkMap: Record<string, string>;
/**
 * Checks if the witness verification hash matches the hash timestamped on an
 * Ethereum blockchain, via etherscan.io.
 * Steps:
 * - Determines the etherscan.io witness url from the witness network passed
 *   in.
 * - Does a lookup of a hash from the witness url combined with the transaction
 *   hash.
 * - Returns true if witnessVerificationHash equals the hash value returned
 *   from the previous step, false otherwise.
 * @param {string} witnessNetwork see the keys of witnessNetworkMap for
 *     possible values.
 * @param {string} txHash the Ethereum transaction hash.
 * @param {string} witnessVerificationHash SHA3 verification hash
 * @returns {Promise<boolean>} whether the hash in the lookup matches witnessVerificationHash
 */
declare function checkEtherScan(witnessNetwork: string, txHash: string, witnessVerificationHash: string): Promise<CheckEtherScanResult>;
export { checkEtherScan, witnessNetworkMap };
