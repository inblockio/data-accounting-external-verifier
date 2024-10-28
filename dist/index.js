"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AquaVerifier: () => AquaVerifier,
  ResultStatusEnum: () => ResultStatusEnum,
  getTimestampDirect: () => getTimestampDirect,
  getTimestampSafe: () => getTimestampSafe
});
module.exports = __toCommonJS(src_exports);

// src/v1_2/models.ts
function getTimestampDirect(pageData) {
  if (pageData.pages.length > 0) {
    const firstPage = pageData.pages[0];
    const firstRevisionKey = Object.keys(firstPage.revisions)[0];
    return firstPage.revisions[firstRevisionKey].metadata.time_stamp;
  }
  return void 0;
}
function getTimestampSafe(pageData) {
  return pageData.pages[0]?.revisions[Object.keys(pageData.pages[0]?.revisions || {})[0]]?.metadata.time_stamp;
}
var ResultStatusEnum = /* @__PURE__ */ ((ResultStatusEnum2) => {
  ResultStatusEnum2[ResultStatusEnum2["MISSING"] = 0] = "MISSING";
  ResultStatusEnum2[ResultStatusEnum2["AVAILABLE"] = 1] = "AVAILABLE";
  return ResultStatusEnum2;
})(ResultStatusEnum || {});

// src/v1_2/utils.ts
var import_js_sha3 = __toESM(require("js-sha3"));
var import_ethers = require("ethers");

// src/v1_2/check_etherscan.ts
var import_axios = __toESM(require("axios"));
var witnessNetworkMap = {
  "mainnet": "https://etherscan.io/tx",
  "sepolia": "https://sepolia.etherscan.io/tx",
  "holesky": "https://holesky.etherscan.io/tx"
};
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function checkEtherScan(witnessNetwork, txHash, witnessVerificationHash) {
  let cesResult = {
    verificationHashMatches: false,
    message: "",
    successful: false
  };
  try {
    const witnessURL = witnessNetworkMap[witnessNetwork];
    const response = await import_axios.default.get(`${witnessURL}/${txHash}`, {
      responseType: "text"
    });
    if (response.status !== 200) {
      cesResult.message = `ERROR HTTP ${response.status} ${response.statusText}`;
      return cesResult;
    }
    const body = response.data;
    const re = /<span id=["']rawinput["'][^>]*>(.*?)<\/span>/i;
    const match = body.match(re);
    let status = "";
    if (match && match[1]) {
      let result = match[1].split("0x9cef4ea1")[1];
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
    status = "Transaction hash not found";
    cesResult.message = status;
    await sleep(300);
    return cesResult;
  } catch (e) {
    console.log("CHECK ETHERSCAN LOG ERROR: ", e);
    if (import_axios.default.isAxiosError(e)) {
      if (e.code === "ECONNABORTED") {
        cesResult.message = "Request timed out";
      } else if (e.response) {
        cesResult.message = `HTTP Error: ${e.response.status} ${e.response.statusText}`;
      } else if (e.request) {
        cesResult.message = "No response received from server";
      } else {
        cesResult.message = `An error occurred: ${e.message}`;
      }
    } else {
      cesResult.message = `An error occurred: ${e}`;
    }
    return cesResult;
  }
}

// src/v1_2/utils.ts
function getHashSum(content) {
  return content === "" ? "" : import_js_sha3.default.sha3_512(content);
}
function generateHashFromBase64(b64) {
  let hash = import_js_sha3.default.sha3_512(Buffer.from(b64, "base64"));
  return hash;
}
function verifyFileUtil(data) {
  const fileContentHash = data.content.file_hash || null;
  if (fileContentHash === null) {
    return [
      false,
      { error_message: "Revision contains a file, but no file content hash", file_hash: null }
    ];
  }
  const fileContent = data.file?.data;
  const hashFromb64 = generateHashFromBase64(fileContent ?? "");
  if (fileContentHash !== hashFromb64) {
    return [false, { error_message: "File content hash does not match", file_hash: null }];
  }
  return [true, { file_hash: fileContentHash, error_message: null }];
}
function verifyContentUtil(data) {
  let content = "";
  for (const slotContent of Object.values(data.content)) {
    content += slotContent;
  }
  const contentHash = getHashSum(content);
  let contentHashMatches = contentHash === data.content_hash;
  if (contentHashMatches) {
    return [contentHashMatches, contentHash];
  }
  return [false, "Content hash does not match"];
}
function verifyMetadataUtil(data) {
  const metadataHash = calculateMetadataHash(
    data.domain_id,
    data.time_stamp,
    data.previous_verification_hash ?? "",
    data.merge_hash ?? ""
  );
  let metadataHashMatches = metadataHash === data.metadata_hash;
  if (metadataHashMatches) {
    return [metadataHashMatches, metadataHash];
  }
  return [false, "Metadata hash does not match"];
}
function calculateMetadataHash(domainId, timestamp, previousVerificationHash = "", mergeHash = "") {
  return getHashSum(domainId + timestamp + previousVerificationHash + mergeHash);
}
function verifySignatureUtil(data, verificationHash) {
  let signatureOk = false;
  let status = "";
  if (verificationHash === "") {
    return [signatureOk, "Verification hash must not be empty"];
  }
  const paddedMessage = `I sign the following page verification_hash: [0x${verificationHash}]`;
  try {
    const recoveredAddress = import_ethers.ethers.recoverAddress(
      import_ethers.ethers.hashMessage(paddedMessage),
      data.signature
    );
    signatureOk = recoveredAddress.toLowerCase() === data.wallet_address.toLowerCase();
    status = signatureOk ? "Signature is Valid" : "Signature is invalid";
  } catch (e) {
    status = `An error occured retrieving signature : ${e}`;
  }
  return [signatureOk, status];
}
async function verifyWitnessUtil(witnessData, verification_hash, doVerifyMerkleProof) {
  const actual_witness_event_verification_hash = getHashSum(
    witnessData.domain_snapshot_genesis_hash + witnessData.merkle_root
  );
  const etherScanResult = await checkEtherScan(
    witnessData.witness_network,
    witnessData.witness_event_transaction_hash,
    actual_witness_event_verification_hash
  );
  if (actual_witness_event_verification_hash != witnessData.witness_event_verification_hash) {
    return [false, "Verification hashes do not match"];
  }
  if (doVerifyMerkleProof) {
    if (verification_hash === witnessData.domain_snapshot_genesis_hash) {
      return [true, "Verification hash is the same us domain snapshot genesis hash"];
    } else {
      const merkleProofIsOK = verifyMerkleIntegrity(
        witnessData.structured_merkle_proof,
        verification_hash
      );
      return [merkleProofIsOK, merkleProofIsOK ? "Merkle proof is OK" : "Error verifying merkle proof"];
    }
  }
  return [etherScanResult.successful, etherScanResult.message];
}
function verifyMerkleIntegrity(merkleBranch, verificationHash) {
  if (merkleBranch.length === 0) {
    return false;
  }
  let prevSuccessor = null;
  for (const idx in merkleBranch) {
    const node = merkleBranch[idx];
    const leaves = [node.left_leaf, node.right_leaf];
    if (prevSuccessor) {
      if (!leaves.includes(prevSuccessor)) {
        return false;
      }
    } else {
      if (!leaves.includes(verificationHash)) {
        return false;
      }
    }
    let calculatedSuccessor;
    if (!node.left_leaf) {
      calculatedSuccessor = node.right_leaf;
    } else if (!node.right_leaf) {
      calculatedSuccessor = node.left_leaf;
    } else {
      calculatedSuccessor = getHashSum(node.left_leaf + node.right_leaf);
    }
    if (calculatedSuccessor !== node.successor) {
      return false;
    }
    prevSuccessor = node.successor;
  }
  return true;
}

// src/v1_2/v1_2.ts
async function verifyRevision(revision) {
  let defaultResultStatus = {
    status: 0 /* MISSING */,
    successful: false,
    message: ""
  };
  let revisionResult = {
    successful: false,
    file_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
    content_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
    witness_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
    signature_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
    metadata_verification: JSON.parse(JSON.stringify(defaultResultStatus))
  };
  const [fileIsCorrect, fileOut] = verifyFileUtil(revision.content);
  revisionResult.file_verification.status = 1 /* AVAILABLE */;
  revisionResult.file_verification.successful = fileIsCorrect;
  revisionResult.file_verification.message = fileOut.error_message ?? "";
  let [verifyContentIsOkay, resultMessage] = verifyContentUtil(revision.content);
  revisionResult.content_verification.status = 1 /* AVAILABLE */;
  revisionResult.content_verification.successful = verifyContentIsOkay;
  revisionResult.content_verification.message = resultMessage;
  let [metadataOk, metadataHashMessage] = verifyMetadataUtil(revision.metadata);
  revisionResult.metadata_verification.status = 1 /* AVAILABLE */;
  revisionResult.metadata_verification.successful = metadataOk;
  revisionResult.metadata_verification.message = metadataHashMessage;
  if (revision.signature) {
    let [signatureOk, signatureMessage] = verifySignatureUtil(revision.signature, revision.metadata.previous_verification_hash ?? "");
    revisionResult.signature_verification.status = 1 /* AVAILABLE */;
    revisionResult.signature_verification.successful = signatureOk;
    revisionResult.signature_verification.message = signatureMessage;
  }
  if (revision.witness) {
    try {
      const [success, message] = await verifyWitnessUtil(
        revision.witness,
        revision.metadata.previous_verification_hash ?? "",
        revision.witness.structured_merkle_proof.length > 1
      );
      revisionResult.witness_verification.status = 1 /* AVAILABLE */;
      revisionResult.witness_verification.successful = success;
      revisionResult.witness_verification.message = message;
    } catch (err) {
      console.log("Witnessing error: ", err);
    }
  }
  let allSuccessful = true;
  for (const verification of Object.values(revisionResult)) {
    if (verification.status === 1 /* AVAILABLE */ && !verification.successful) {
      allSuccessful = false;
      break;
    }
  }
  revisionResult.successful = allSuccessful;
  return revisionResult;
}
function verifySignature(signature, previous_verification_hash) {
  let defaultResultStatus = {
    status: 0 /* MISSING */,
    successful: false,
    message: ""
  };
  let [signatureOk, signatureMessage] = verifySignatureUtil(signature, previous_verification_hash);
  defaultResultStatus.status = 1 /* AVAILABLE */;
  defaultResultStatus.successful = signatureOk;
  defaultResultStatus.message = signatureMessage;
  return defaultResultStatus;
}
async function verifyWitness(witness, verification_hash, doVerifyMerkleProof) {
  let defaultResultStatus = {
    status: 0 /* MISSING */,
    successful: false,
    message: ""
  };
  let [witnessOk, witnessMessage] = await verifyWitnessUtil(witness, verification_hash, doVerifyMerkleProof);
  defaultResultStatus.status = 1 /* AVAILABLE */;
  defaultResultStatus.successful = witnessOk;
  defaultResultStatus.message = witnessMessage;
  return defaultResultStatus;
}
async function verifyAquaChain(aquaChain) {
  const hashChainResult = {
    successful: true,
    revisionResults: []
  };
  const revisionHashes = Object.keys(aquaChain.revisions);
  for (let j = 0; j < revisionHashes.length; j++) {
    const revision = aquaChain.revisions[revisionHashes[j]];
    const revisionResult = await verifyRevision(revision);
    hashChainResult.revisionResults.push(revisionResult);
  }
  for (let i = 0; i < hashChainResult.revisionResults.length; i++) {
    const revisionResult = hashChainResult.revisionResults[i];
    if (!revisionResult.successful) {
      hashChainResult.successful = false;
      break;
    }
  }
  return Promise.resolve(hashChainResult);
}

// src/aquaVerifier.ts
var AquaVerifier = class {
  options;
  constructor(options = { version: 1.2 }) {
    this.options = {
      strict: false,
      allowNull: false,
      customMessages: {},
      ...options
    };
  }
  fetchVerificationOptions() {
    return this.options;
  }
  verifyRevision(revision) {
    if (this.options.version == 1.2) {
      return verifyRevision(revision);
    }
    return null;
  }
  verifySignature(signature, previous_hash) {
    if (this.options.version == 1.2) {
      return verifySignature(signature, previous_hash);
    }
    return null;
  }
  verifyWitness(witness, verification_hash, doVerifyMerkleProof) {
    if (this.options.version == 1.2) {
      return verifyWitness(witness, verification_hash, doVerifyMerkleProof);
    }
    return null;
  }
  // TODO: Fix: verifier can't sign nor witness files. So this two methods might be out of place here because the verifier is verify AQUA Chain
  // public signFile() {
  // }
  // public witnessFile() {
  // }
  verifyMerkleTree() {
    throw new Error("Unimplmeneted error .... ");
  }
  verifyAquaChain(hashChain) {
    if (this.options.version == 1.2) {
      return verifyAquaChain(hashChain);
    }
    return null;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AquaVerifier,
  ResultStatusEnum,
  getTimestampDirect,
  getTimestampSafe
});
