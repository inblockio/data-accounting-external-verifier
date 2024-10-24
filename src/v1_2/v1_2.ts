import { ResultStatus, ResultStatusEnum, Revision_1_2, RevisionContent_1_2, RevisionSignature_1_2, RevisionVerificationResult, VerifyFileResult, RevisionWitness_1_2 } from "./models";
import { getHashSum, jsonReplacer, verifyContentUtil, verifyFileUtil, verifyMetadataUtil, verifyWitnessUtil, verifySignatureUtil } from "./utils";

const INVALID_VERIFICATION_STATUS = "INVALID"
const VERIFIED_VERIFICATION_STATUS = "VERIFIED"
const ERROR_VERIFICATION_STATUS = "ERROR"

export function verifyRevision(revision: Revision_1_2): RevisionVerificationResult {
    let defaultResultStatus: ResultStatus = {
        status: ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    }

    let revisionResult: RevisionVerificationResult = {
        successful: false,
        file_verification: structuredClone(defaultResultStatus),
        content_verification: structuredClone(defaultResultStatus),
        witness_verification: structuredClone(defaultResultStatus),
        signature_verification: structuredClone(defaultResultStatus),
        metadata_verification: structuredClone(defaultResultStatus)
    }

    const [fileIsCorrect, fileOut] = verifyFileUtil(revision.content)
    revisionResult.file_verification.status = ResultStatusEnum.AVAILABLE
    revisionResult.file_verification.successful = fileIsCorrect
    revisionResult.file_verification.message = fileOut.error_message ?? ""


    // Verify Content
    let [ok, resultMessage] = verifyContentUtil(revision.content)
    revisionResult.content_verification.status = ResultStatusEnum.AVAILABLE
    revisionResult.content_verification.successful = ok
    revisionResult.content_verification.message = resultMessage

    // Verifty Metadata 
    let [metadataOk, metadataHashMessage] = verifyMetadataUtil(revision.metadata)

    revisionResult.metadata_verification.status = ResultStatusEnum.AVAILABLE
    revisionResult.metadata_verification.successful = metadataOk
    revisionResult.metadata_verification.message = metadataHashMessage

    // Verify signature
    if (revision.signature) {
        let [signatureOk, signatureMessage] = verifySignatureUtil(revision?.signature, revision.metadata.previous_verification_hash ?? "")

        revisionResult.signature_verification.status = ResultStatusEnum.AVAILABLE
        revisionResult.signature_verification.successful = signatureOk
        revisionResult.signature_verification.message = signatureMessage
    }

    // Verify witness
    if (revision.witness) {
        // let [signatureOk, signatureMessage] = await 
        verifyWitnessUtil(revision?.witness, revision.metadata.previous_verification_hash ?? "", revision.witness.structured_merkle_proof.length > 1).then(([success, message]) => {
            revisionResult.signature_verification.status = ResultStatusEnum.AVAILABLE
            revisionResult.signature_verification.successful = success
            revisionResult.signature_verification.message = message
        })
    }

    return revisionResult
}


export function verifySignature(signature: RevisionSignature_1_2, previous_verification_hash : string):ResultStatus{

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



export async function verifyWitness(witness: RevisionWitness_1_2,  verification_hash: string,
    doVerifyMerkleProof: boolean,):Promise<ResultStatus>{

    let defaultResultStatus: ResultStatus = {
        status: ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    }
   
    let [witnessOk, witnessMessage] = await verifyWitnessUtil(witness, verification_hash,doVerifyMerkleProof)

    defaultResultStatus.status = ResultStatusEnum.AVAILABLE
    defaultResultStatus.successful = witnessOk
    defaultResultStatus.message = witnessMessage

    return defaultResultStatus;
}