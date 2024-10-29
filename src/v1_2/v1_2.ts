import { ResultStatus, ResultStatusEnum, Revision_1_2, RevisionContent_1_2, RevisionSignature_1_2, RevisionVerificationResult, VerifyFileResult, RevisionWitness_1_2, PageData_1_2, HashChain_1_2, RevisionAquaChainResult } from "./models";
import { getHashSum, jsonReplacer, verifyContentUtil, verifyFileUtil, verifyMetadataUtil, verifyWitnessUtil, verifySignatureUtil } from "./utils";

const INVALID_VERIFICATION_STATUS = "INVALID"
const VERIFIED_VERIFICATION_STATUS = "VERIFIED"
const ERROR_VERIFICATION_STATUS = "ERROR"

export async function verifyRevision(revision: Revision_1_2, alchemyKey: string): Promise<RevisionVerificationResult> {
    let defaultResultStatus: ResultStatus = {
        status: ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    }

    let revisionResult: RevisionVerificationResult = {
        successful: false,
        file_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
        content_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
        witness_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
        signature_verification: JSON.parse(JSON.stringify(defaultResultStatus)),
        metadata_verification: JSON.parse(JSON.stringify(defaultResultStatus))
    }

    const [fileIsCorrect, fileOut] = verifyFileUtil(revision.content);
    revisionResult.file_verification.status = ResultStatusEnum.AVAILABLE;
    revisionResult.file_verification.successful = fileIsCorrect;
    revisionResult.file_verification.message = fileOut.error_message ?? "";

    // Verify Content
    let [verifyContentIsOkay, resultMessage] = verifyContentUtil(revision.content);
    revisionResult.content_verification.status = ResultStatusEnum.AVAILABLE;
    revisionResult.content_verification.successful = verifyContentIsOkay;
    revisionResult.content_verification.message = resultMessage;

    // Verify Metadata 
    let [metadataOk, metadataHashMessage] = verifyMetadataUtil(revision.metadata);
    revisionResult.metadata_verification.status = ResultStatusEnum.AVAILABLE;
    revisionResult.metadata_verification.successful = metadataOk;
    revisionResult.metadata_verification.message = metadataHashMessage;

    // Verify Signature
    if (revision.signature) {
        let [signatureOk, signatureMessage] = verifySignatureUtil(revision.signature, revision.metadata.previous_verification_hash ?? "");
        revisionResult.signature_verification.status = ResultStatusEnum.AVAILABLE;
        revisionResult.signature_verification.successful = signatureOk;
        revisionResult.signature_verification.message = signatureMessage;
    }

    // Verify Witness (asynchronous)
    if (revision.witness) {
        try {
            const [success, message] = await verifyWitnessUtil(
                revision.witness,
                revision.metadata.previous_verification_hash ?? "",
                revision.witness.structured_merkle_proof.length > 1,
                alchemyKey
            );
            revisionResult.witness_verification.status = ResultStatusEnum.AVAILABLE;
            revisionResult.witness_verification.successful = success;
            revisionResult.witness_verification.message = message // message if needed
        } catch (err) {
            console.log("Witnessing error: ", err);
        }
    }

    // Check the overall status
    let allSuccessful = true;
    for (const verification of Object.values(revisionResult)) {
        if (verification.status === ResultStatusEnum.AVAILABLE && !verification.successful) {
            allSuccessful = false;
            break;
        }
    }

    // Update the overall successful status
    revisionResult.successful = allSuccessful;

    return revisionResult;
}



export function verifySignature(signature: RevisionSignature_1_2, previous_verification_hash: string): ResultStatus {

    let defaultResultStatus: ResultStatus = {
        status: ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    }

    let [signatureOk, signatureMessage] = verifySignatureUtil(signature, previous_verification_hash)

    defaultResultStatus.status = ResultStatusEnum.AVAILABLE
    defaultResultStatus.successful = signatureOk
    defaultResultStatus.message = signatureMessage

    return defaultResultStatus;

}


export async function verifyWitness(witness: RevisionWitness_1_2, verification_hash: string,
    doVerifyMerkleProof: boolean, alchemyKey: string): Promise<ResultStatus> {

    let defaultResultStatus: ResultStatus = {
        status: ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    }


    let [witnessOk, witnessMessage] = await verifyWitnessUtil(witness, verification_hash, doVerifyMerkleProof, alchemyKey)

    defaultResultStatus.status = ResultStatusEnum.AVAILABLE
    defaultResultStatus.successful = witnessOk
    defaultResultStatus.message = witnessMessage

    return defaultResultStatus;
}

export async function verifyAquaChain(aquaChain: HashChain_1_2, alchemyKey: string) : Promise<RevisionAquaChainResult> {

    const hashChainResult: RevisionAquaChainResult = {
        successful: true,
        revisionResults: []
    }

    const revisionHashes = Object.keys(aquaChain.revisions);

    for (let j = 0; j < revisionHashes.length; j++) {
        const revision = aquaChain.revisions[revisionHashes[j]]
        const revisionResult : RevisionVerificationResult = await verifyRevision(revision, alchemyKey)
        hashChainResult.revisionResults.push(revisionResult)
    }

    for (let i = 0; i < hashChainResult.revisionResults.length; i++) {
        const revisionResult = hashChainResult.revisionResults[i];
        if (!revisionResult.successful) {
            hashChainResult.successful = false
            break;
        }
    }
    return Promise.resolve(hashChainResult);
}

