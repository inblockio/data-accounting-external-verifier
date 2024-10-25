import { CheckEtherScanResult } from "./models";

const re = /<span id="rawinput".*<\/span>/

const witnessNetworkMap: Record<string, string> = {
  'mainnet': 'https://etherscan.io/tx',
  'sepolia': 'https://sepolia.etherscan.io/tx',
  'holesky': 'https://holesky.etherscan.io/tx',
}

function sleep(ms: number) {
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
// async function checkEtherScan(witnessNetwork: string, txHash: string, witnessVerificationHash: string): Promise<CheckEtherScanResult> {
//     let cesResult: CheckEtherScanResult = {
//         verificationHashMatches: false,
//         message: "",
//         successful: false
//     }
//   try {
//     const witnessURL = witnessNetworkMap[witnessNetwork]
//     const options = {
//       timeout: 10000  // 10 seconds
//     }
//     const response = await fetch(`${witnessURL}/${txHash}`, { signal: AbortSignal.timeout(options.timeout) })
//     if (!response.ok) {
//         cesResult.message = `ERROR HTTP ${response.status} ${response.statusText}`
//       return cesResult
//     }
//     const body = await response.text()
//     const outArray = re.exec(body)
//     let status = ''
//     if (!!outArray) {
//       let result = outArray[0].split('0x9cef4ea1')[1]
//       result = result.slice(0, 128)
//       //console.log(result == witnessVerificationHash)
//       status = `${result == witnessVerificationHash}`
//       cesResult.message = "Transaction found"
//       cesResult.successful = true
//       cesResult.verificationHashMatches = true
//       return cesResult
//     } else {
//       status = 'Transaction hash not found'
//     }
//     cesResult.message = status
//     // To avoid IP banning by etherscan.io
//     await sleep(300)
//     return cesResult
//   }
//   catch (e: any) {
//     console.log("CHECK ETHERSCAN LOG ERROR: ", e)
//     cesResult.message = `An error occured: ${e}`
//     return cesResult
//   }
// }

import axios from 'axios';

// async function checkEtherScan(witnessNetwork: string, txHash: string, witnessVerificationHash: string): Promise<CheckEtherScanResult> {
//   let cesResult: CheckEtherScanResult = {
//     verificationHashMatches: false,
//     message: "",
//     successful: false
//   }

//   try {
//     const witnessURL = witnessNetworkMap[witnessNetwork]
//     // const options = {
//     //   responseType: 'text',
//       //timeout: 10000 // 10 seconds
//     // }

//     const response = await axios.get(`${witnessURL}/${txHash}`, {
//       responseType : "text"
//     })
    
//     console.info("Bdy from response status ", response.status)
//     // Axios automatically throws on non-200 status codes, but keeping similar structure
//     if (response.status !== 200) {
//       cesResult.message = `ERROR HTTP ${response.status} ${response.statusText}`
//       return cesResult
//     }

//     const body = response.data // Axios automatically parses JSON, but here we expect text
   
//     console.log("out body  is  ", body);

//     const outArray = re.exec(body)

//     console.log("out arrau is  ", outArray);
//     console.log("=================================")
//     let status = ''

//     if (!!outArray) {
//       let result = outArray[0].split('0x9cef4ea1')[1]
//       result = result.slice(0, 128)
//       //console.log(result == witnessVerificationHash)
//       status = `${result == witnessVerificationHash}`
//       cesResult.message = "Transaction found"
//       cesResult.successful = true
//       cesResult.verificationHashMatches = true
//       return cesResult
//     } else {
//       status = 'Transaction hash not found'
//     }

//     cesResult.message = status
//     // To avoid IP banning by etherscan.io
//     await sleep(300)
//     return cesResult
//   }
//   catch (e: any) {
//     console.log("CHECK ETHERSCAN LOG ERROR: ", e)
//     // Axios specific error handling
//     if (axios.isAxiosError(e)) {
//       if (e.code === 'ECONNABORTED') {
//         cesResult.message = 'Request timed out'
//       } else if (e.response) {
//         cesResult.message = `HTTP Error: ${e.response.status} ${e.response.statusText}`
//       } else if (e.request) {
//         cesResult.message = 'No response received from server'
//       } else {
//         cesResult.message = `An error occurred: ${e.message}`
//       }
//     } else {
//       cesResult.message = `An error occurred: ${e}`
//     }
//     return cesResult
//   }
// }


async function checkEtherScan(witnessNetwork: string, txHash: string, witnessVerificationHash: string): Promise<CheckEtherScanResult> {
  let cesResult: CheckEtherScanResult = {
    verificationHashMatches: false,
    message: "",
    successful: false
  }

  try {
    const witnessURL = witnessNetworkMap[witnessNetwork]
    

    const response = await axios.get(`${witnessURL}/${txHash}`, {
      responseType: "text"
    })
    
    if (response.status !== 200) {
      cesResult.message = `ERROR HTTP ${response.status} ${response.statusText}`
      return cesResult
    }

    const body = response.data
    // Updated regex to capture the content inside the span
    const re = /<span id="rawinput"[^>]*>(.*?)<\/span>/i
    const match = re.exec(body)
    let status = ''

    if (match && match[1]) {  // match[1] contains the content inside the span
      let result = match[1].split('0x9cef4ea1')[1]
      if (result) {
        result = result.slice(0, 128)
        status = `${result == witnessVerificationHash}`
        cesResult.message = "Transaction found"
        cesResult.successful = true
        cesResult.verificationHashMatches = true
        return cesResult
      }
    }
    
    status = 'Transaction hash not found'
    cesResult.message = status
    // To avoid IP banning by etherscan.io
    await sleep(300)
    return cesResult
  }
  catch (e: any) {
    console.log("CHECK ETHERSCAN LOG ERROR: ", e)
    if (axios.isAxiosError(e)) {
      if (e.code === 'ECONNABORTED') {
        cesResult.message = 'Request timed out'
      } else if (e.response) {
        cesResult.message = `HTTP Error: ${e.response.status} ${e.response.statusText}`
      } else if (e.request) {
        cesResult.message = 'No response received from server'
      } else {
        cesResult.message = `An error occurred: ${e.message}`
      }
    } else {
      cesResult.message = `An error occurred: ${e}`
    }
    return cesResult
  }
}

async function testCheckEtherScan() {
  let out = await checkEtherScan('sepolia', 'stuff', '9e518db9cfdcf9854bb7e5097ef15a77e3409c6ed3e26171ec62a075c4ef179a1651560e11b8bdd3e2ed70a1097afd4744b1dbf07c3c68884b1ebaca3026764d')
  console.log(out)
  out = await checkEtherScan('sepolia', '0x1b35843949a90869a7f79a132afcda0271799afd766140da1b13ae984beb6a80', 'stuff')
  console.log(out)
  out = await checkEtherScan('sepolia', '0x1b35843949a90869a7f79a132afcda0271799afd766140da1b13ae984beb6a80', '9e518db9cfdcf9854bb7e5097ef15a77e3409c6ed3e26171ec62a075c4ef179a1651560e11b8bdd3e2ed70a1097afd4744b1dbf07c3c68884b1ebaca3026764d')
  console.log(out)
}

// testCheckEtherScan()
export { checkEtherScan, witnessNetworkMap}
