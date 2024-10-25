
import sha3 from "js-sha3"
import { MerkleNode, RevisionContent_1_2, RevisionMetadata_1_2, RevisionSignature_1_2, RevisionWitness_1_2, VerifyFileResult } from "./models"
import { ethers } from "ethers"
import { checkEtherScan } from "./check_etherscan"
import { createHash, Hash } from "crypto"

export function getHashSum(content: string) {
  return content === "" ? "" : sha3.sha3_512(content)
}


function generateHashFromBase64(b64: string) {
  // Create a SHA3-512 hasher
  const fileHasher = createHash('sha3-512');

  // Update the hasher with the base64 content as a Buffer
  fileHasher.update(Buffer.from(b64, 'base64'));

  // Finalize and return the hash as a Buffer
  let hash = fileHasher.digest('hex')
  return hash;
}

// TODO: Fix this function
export function verifyFileUtil(data: RevisionContent_1_2): [boolean, VerifyFileResult] {
  const fileContentHash = data.content.file_hash || null
  if (fileContentHash === null) {
    return [
      false,
      { error_message: "Revision contains a file, but no file content hash", file_hash: null },
    ]
  }
  const fileContent = data.file?.data
  const hashFromb64 = generateHashFromBase64(fileContent ?? "")
  
  if (fileContentHash !== hashFromb64) {
    return [false, { error_message: "File content hash does not match", file_hash: null }]
  }

  return [true, { file_hash: fileContentHash, error_message: null }]
}

export function verifyContentUtil(data: RevisionContent_1_2): [boolean, string] {
  let content = ""
  for (const slotContent of Object.values(data.content)) {
    content += slotContent
  }
  const contentHash = getHashSum(content)
  let contentHashMatches = contentHash === data.content_hash
  if (contentHashMatches) {
    return [contentHashMatches, contentHash]
  }
  return [false, "Content hash does not match"]
}

export function verifyMetadataUtil(data: RevisionMetadata_1_2): [boolean, string] {
  const metadataHash = calculateMetadataHash(
    data.domain_id,
    data.time_stamp,
    data.previous_verification_hash ?? "",
    data.merge_hash ?? ""
  )

  let metadataHashMatches = metadataHash === data.metadata_hash
  if (metadataHashMatches) {
    return [metadataHashMatches, metadataHash]
  }
  return [false, "Metadata hash does not match"]
}


function calculateMetadataHash(
  domainId: string,
  timestamp: string,
  previousVerificationHash: string = "",
  mergeHash: string = ""
) {
  return getHashSum(domainId + timestamp + previousVerificationHash + mergeHash)
}


export function verifySignatureUtil(data: RevisionSignature_1_2, verificationHash: string): [boolean, string] {
  // TODO enforce that the verificationHash is a correct SHA3 sum string
  // Specify signature correctness
  let signatureOk = false
  let status = ""

  if (verificationHash === "") {
    // The verificationHash MUST NOT be empty. This also implies that a genesis revision cannot
    // contain a signature.
    return [signatureOk, "Verification hash must not be empty"]
  }
  // Signature verification
  // The padded message is required
  const paddedMessage =
    `I sign the following page verification_hash: [0x${verificationHash}]`
  try {
    const recoveredAddress = ethers.recoverAddress(
      ethers.hashMessage(paddedMessage),
      data.signature
    )
    signatureOk = recoveredAddress.toLowerCase() === data.wallet_address.toLowerCase()
    status = signatureOk ? "Signature is Valid" : "Signature is invalid"
  } catch (e) {
    // continue regardless of error
    status = `An error occured retrieving signature : ${e}`
  }

  //  = signatureOk ? "VALID" : "INVALID"

  return [signatureOk, status]
}


export async function verifyWitnessUtil(
  witnessData: RevisionWitness_1_2,
  verification_hash: string,
  doVerifyMerkleProof: boolean,
): Promise<[boolean, string]> {
  const actual_witness_event_verification_hash = getHashSum(
    witnessData.domain_snapshot_genesis_hash + witnessData.merkle_root
  )

  // Do online lookup of transaction hash
  const etherScanResult = await checkEtherScan(
    witnessData.witness_network,
    witnessData.witness_event_transaction_hash,
    actual_witness_event_verification_hash
  )

  if (
    actual_witness_event_verification_hash !=
    witnessData.witness_event_verification_hash
  ) {
    return [false, "Verification hashes do not match"]
  }
  // At this point, we know that the witness matches.
  if (doVerifyMerkleProof) {
    if (verification_hash === witnessData.domain_snapshot_genesis_hash) {
      return [true, 'Verification hash is the same us domain snapshot genesis hash']
    } else {
      const merkleProofIsOK = verifyMerkleIntegrity(
        witnessData.structured_merkle_proof,
        verification_hash
      )

      return [merkleProofIsOK, merkleProofIsOK ? "Merkle proof is OK" : "Error verifying merkle proof"]
    }
  }

  return [etherScanResult.successful, etherScanResult.message]
}

function verifyMerkleIntegrity(merkleBranch: MerkleNode[], verificationHash: string) {
  if (merkleBranch.length === 0) {
    return false
  }

  let prevSuccessor = null
  for (const idx in merkleBranch) {
    const node = merkleBranch[idx]
    const leaves = [node.left_leaf, node.right_leaf]
    if (prevSuccessor) {
      if (!leaves.includes(prevSuccessor)) {
        return false
      }
    } else {
      // This means we are at the beginning of the loop.
      if (!leaves.includes(verificationHash)) {
        // In the beginning, either the left or right leaf must match the
        // verification hash.
        return false
      }
    }

    let calculatedSuccessor: string
    if (!node.left_leaf) {
      calculatedSuccessor = node.right_leaf
    } else if (!node.right_leaf) {
      calculatedSuccessor = node.left_leaf
    } else {
      calculatedSuccessor = getHashSum(node.left_leaf + node.right_leaf)
    }
    if (calculatedSuccessor !== node.successor) {
      //console.log("Expected successor", calculatedSuccessor)
      //console.log("Actual successor", node.successor)
      return false
    }
    prevSuccessor = node.successor
  }
  return true
}


// Completely unnecessary

export const jsonReplacer = (key: string, value: any) => {
  if (key === 'file') {
    return "****"; // Removing the property by returning undefined
  }
  // if (key === 'email') {
  //   return value.replace(/@example.com$/, '@domain.com'); // Modify email
  // }
  return value; // Return other properties unchanged
};