"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.witnessNetworkMap = void 0;
exports.checkEtherScan = checkEtherScan;
const axios_1 = __importDefault(require("axios"));
const re = /<span id="rawinput".*<\/span>/;
const witnessNetworkMap = {
    'mainnet': 'https://etherscan.io/tx',
    'sepolia': 'https://sepolia.etherscan.io/tx',
    'holesky': 'https://holesky.etherscan.io/tx',
};
exports.witnessNetworkMap = witnessNetworkMap;
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
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
async function checkEtherScan(witnessNetwork, txHash, witnessVerificationHash) {
    let cesResult = {
        verificationHashMatches: false,
        message: "",
        successful: false
    };
    try {
        const witnessURL = witnessNetworkMap[witnessNetwork];
        const response = await axios_1.default.get(`${witnessURL}/${txHash}`, {
            responseType: "text"
        });
        if (response.status !== 200) {
            cesResult.message = `ERROR HTTP ${response.status} ${response.statusText}`;
            return cesResult;
        }
        const body = response.data;
        const re = /<span id=["']rawinput["'][^>]*>(.*?)<\/span>/i;
        const match = body.match(re);
        let status = '';
        if (match && match[1]) { // match[1] contains the content inside the span
            let result = match[1].split('0x9cef4ea1')[1];
            if (result) {
                result = result.slice(0, 128);
                const hashMatches = result === witnessVerificationHash;
                status = `${hashMatches}`;
                cesResult.message = hashMatches ? "Verification Hash matches" : "Verification Hash does not match";
                cesResult.successful = hashMatches;
                cesResult.verificationHashMatches = hashMatches;
                return cesResult;
            }
        }
        status = 'Transaction hash not found';
        cesResult.message = status;
        // To avoid IP banning by etherscan.io
        await sleep(300);
        return cesResult;
    }
    catch (e) {
        console.log("CHECK ETHERSCAN LOG ERROR: ", e);
        if (axios_1.default.isAxiosError(e)) {
            if (e.code === 'ECONNABORTED') {
                cesResult.message = 'Request timed out';
            }
            else if (e.response) {
                cesResult.message = `HTTP Error: ${e.response.status} ${e.response.statusText}`;
            }
            else if (e.request) {
                cesResult.message = 'No response received from server';
            }
            else {
                cesResult.message = `An error occurred: ${e.message}`;
            }
        }
        else {
            cesResult.message = `An error occurred: ${e}`;
        }
        return cesResult;
    }
}
async function testCheckEtherScan() {
    let out = await checkEtherScan('sepolia', 'stuff', '9e518db9cfdcf9854bb7e5097ef15a77e3409c6ed3e26171ec62a075c4ef179a1651560e11b8bdd3e2ed70a1097afd4744b1dbf07c3c68884b1ebaca3026764d');
    console.log(out);
    out = await checkEtherScan('sepolia', '0x1b35843949a90869a7f79a132afcda0271799afd766140da1b13ae984beb6a80', 'stuff');
    console.log(out);
    out = await checkEtherScan('sepolia', '0x1b35843949a90869a7f79a132afcda0271799afd766140da1b13ae984beb6a80', '9e518db9cfdcf9854bb7e5097ef15a77e3409c6ed3e26171ec62a075c4ef179a1651560e11b8bdd3e2ed70a1097afd4744b1dbf07c3c68884b1ebaca3026764d');
    console.log(out);
}
