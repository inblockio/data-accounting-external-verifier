
import sha3 from "js-sha3"
import { RevisionContent, RevisionMetadata } from "./models"

export function getHashSum(content: string) {
    return content === "" ? "" : sha3.sha3_512(content)
}

export function verifyContent(data: RevisionContent) {
    let content = ""
    for (const slotContent of Object.values(data.content)) {
        content += slotContent
    }
    const contentHash = getHashSum(content)
    let contentHashMatches = contentHash === data.content_hash
    return [contentHashMatches, contentHash]
}

export function verifyMetadata(data: RevisionMetadata) {
    const metadataHash = calculateMetadataHash(
        data.domain_id,
        data.time_stamp,
        data.previous_verification_hash ?? "",
        data.merge_hash ?? ""
    )
    return [metadataHash === data.metadata_hash, metadataHash]
}


function calculateMetadataHash(
    domainId: string,
    timestamp: string,
    previousVerificationHash: string = "",
    mergeHash: string = ""
) {
    return getHashSum(domainId + timestamp + previousVerificationHash + mergeHash)
}