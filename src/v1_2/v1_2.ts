import { Revision_1_2, RevisionContent, RevisionVerificationResult, VerifyFileResult } from "./models";
import { getHashSum } from "./utils";

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
    let revisionResult: RevisionVerificationResult = {
        verification_hash: revision.metadata.verification_hash,
        status: {
            content: false,
            metadata: false,
            signature: "MISSING",
            witness: "MISSING",
            verification: INVALID_VERIFICATION_STATUS,
            file: "MISSING",
        },
        witness_result: {},
        file_hash: "",
        data: revision
    }

    // Verify File
    if ("file" in revision.content) {
        // This is a file
        const [fileIsCorrect, fileOut] = verifyFile(revision.content)
        if (!fileIsCorrect) {
            revisionResult.status.file = INVALID_VERIFICATION_STATUS
            return revisionResult
        }
        else {
            revisionResult.status.file = "VERIFIED"
            // We are sure it will return a file_hash if file is correct
            revisionResult.file_hash = fileOut.file_hash!!
        }

    }

    return revisionResult
}
