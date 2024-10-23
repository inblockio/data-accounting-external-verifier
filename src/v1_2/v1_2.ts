import { ResultStatus, ResultStatusEnum, Revision_1_2, RevisionContent, RevisionVerificationResult, VerifyFileResult } from "./models";
import { getHashSum, verifyContent } from "./utils";

const INVALID_VERIFICATION_STATUS = "INVALID"
const VERIFIED_VERIFICATION_STATUS = "VERIFIED"
const ERROR_VERIFICATION_STATUS = "ERROR"

function verifyFile(data: RevisionContent): [boolean, VerifyFileResult] {
    const fileContentHash = data.content.file_hash || null
    if (fileContentHash === null) {
        return [
            false,
            { error_message: "Revision contains a file, but no file content hash", file_hash: null },
        ]
    }

    const rawFileContent = Buffer.from(data.file?.data || "", "base64")
    if (fileContentHash !== getHashSum(rawFileContent.toString())) {
        return [false, { error_message: "File content hash does not match", file_hash: null }]
    }

    return [true, { file_hash: fileContentHash, error_message: null }]
}

export function verifyRevision(revision: Revision_1_2): RevisionVerificationResult {
    let defaultResultStatus: ResultStatus = {
        status: ResultStatusEnum.MISSING,
        successful: false,
        message: ""
    }
    let revisionResult: RevisionVerificationResult = {
        successful: false,
        content_verification: defaultResultStatus,
        witness_verification: defaultResultStatus,
        signature_verification: defaultResultStatus,
        metadata_verification: defaultResultStatus
    }

    // Verify File
    if ("file" in revision.content) {
        const [fileIsCorrect, fileOut] = verifyFile(revision.content)
        revisionResult.content_verification.status = ResultStatusEnum.AVAILABLE
        revisionResult.content_verification.successful = fileIsCorrect
        revisionResult.content_verification.message = fileOut.error_message ?? ""
    }

    // Verify Content
    let [ok, contentHash] = verifyContent(revision.content)
    // if (!ok) {
    //     return [false, { error_message: "Content hash doesn't match" }]
    // }

    revisionResult.content_verification.status = ResultStatusEnum.AVAILABLE
    revisionResult.content_verification.successful = fileIsCorrect
    revisionResult.content_verification.message = fileOut.error_message ?? ""

    return revisionResult
}
