"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRevision = verifyRevision;
exports.verifySignature = verifySignature;
exports.verifyWitness = verifyWitness;
exports.verifyAquaChain = verifyAquaChain;
const models_1 = require("./models");
const utils_1 = require("./utils");
const INVALID_VERIFICATION_STATUS = "INVALID";
const VERIFIED_VERIFICATION_STATUS = "VERIFIED";
const ERROR_VERIFICATION_STATUS = "ERROR";
async function verifyRevision(revision) {
    var _a, _b, _c;
    let defaultResultStatus = {
        status: models_1.ResultStatusEnum.MISSING,
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
    const [fileIsCorrect, fileOut] = (0, utils_1.verifyFileUtil)(revision.content);
    revisionResult.file_verification.status = models_1.ResultStatusEnum.AVAILABLE;
    revisionResult.file_verification.successful = fileIsCorrect;
    revisionResult.file_verification.message = (_a = fileOut.error_message) !== null && _a !== void 0 ? _a : "";
    // Verify Content
    let [verifyContentIsOkay, resultMessage] = (0, utils_1.verifyContentUtil)(revision.content);
    revisionResult.content_verification.status = models_1.ResultStatusEnum.AVAILABLE;
    revisionResult.content_verification.successful = verifyContentIsOkay;
    revisionResult.content_verification.message = resultMessage;
    // Verify Metadata 
    let [metadataOk, metadataHashMessage] = (0, utils_1.verifyMetadataUtil)(revision.metadata);
    revisionResult.metadata_verification.status = models_1.ResultStatusEnum.AVAILABLE;
    revisionResult.metadata_verification.successful = metadataOk;
    revisionResult.metadata_verification.message = metadataHashMessage;
    // Verify Signature
    if (revision.signature) {
        let [signatureOk, signatureMessage] = (0, utils_1.verifySignatureUtil)(revision.signature, (_b = revision.metadata.previous_verification_hash) !== null && _b !== void 0 ? _b : "");
        revisionResult.signature_verification.status = models_1.ResultStatusEnum.AVAILABLE;
        revisionResult.signature_verification.successful = signatureOk;
        revisionResult.signature_verification.message = signatureMessage;
    }
    // Verify Witness (asynchronous)
    if (revision.witness) {
        try {
            const [success, message] = await (0, utils_1.verifyWitnessUtil)(revision.witness, (_c = revision.metadata.previous_verification_hash) !== null && _c !== void 0 ? _c : "", revision.witness.structured_merkle_proof.length > 1);
            revisionResult.witness_verification.status = models_1.ResultStatusEnum.AVAILABLE;
            revisionResult.witness_verification.successful = success;
            revisionResult.witness_verification.message = message; // message if needed
        }
        catch (err) {
            console.log("Witnessing error: ", err);
        }
    }
    // Check the overall status
    let allSuccessful = true;
    for (const verification of Object.values(revisionResult)) {
        if (verification.status === models_1.ResultStatusEnum.AVAILABLE && !verification.successful) {
            allSuccessful = false;
            break;
        }
    }
    // Update the overall successful status
    revisionResult.successful = allSuccessful;
    return revisionResult;
}
function verifySignature(signature, previous_verification_hash) {
    let defaultResultStatus = {
        status: models_1.ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    };
    let [signatureOk, signatureMessage] = (0, utils_1.verifySignatureUtil)(signature, previous_verification_hash);
    defaultResultStatus.status = models_1.ResultStatusEnum.AVAILABLE;
    defaultResultStatus.successful = signatureOk;
    defaultResultStatus.message = signatureMessage;
    return defaultResultStatus;
}
async function verifyWitness(witness, verification_hash, doVerifyMerkleProof) {
    let defaultResultStatus = {
        status: models_1.ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    };
    let [witnessOk, witnessMessage] = await (0, utils_1.verifyWitnessUtil)(witness, verification_hash, doVerifyMerkleProof);
    defaultResultStatus.status = models_1.ResultStatusEnum.AVAILABLE;
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
