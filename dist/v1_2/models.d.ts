import { HashChain, Revision, RevisionSignature } from "../models/models";
export interface HashChain_1_2 extends HashChain {
    genesis_hash: string;
    domain_id: string;
    title: string;
    DateFormatter: any;
    namespace: number;
    chain_height: number;
    revisions: Record<string, Revision_1_2>;
}
export interface StructuredMerkleProof {
    left_leaf: string;
    right_leaf: string;
    successor: string;
}
export interface RevisionWitness_1_2 {
    domain_snapshot_genesis_hash: string;
    merkle_root: string;
    witness_network: string;
    witness_event_transaction_hash: string;
    witness_event_verification_hash: string;
    witness_hash: string;
    structured_merkle_proof: StructuredMerkleProof[];
}
export interface RevisionSignature_1_2 extends RevisionSignature {
    signature: string;
    public_key: string;
    signature_hash: string;
    wallet_address: string;
}
export interface Revision_1_2 extends Revision {
    content: RevisionContent_1_2;
    metadata: RevisionMetadata_1_2;
    signature: RevisionSignature_1_2 | null;
    witness: RevisionWitness_1_2 | null;
}
export interface RevisionContent_1_2 {
    file: FileContent | null;
    content: {
        file_hash?: string;
        [key: string]: string | undefined;
    };
    content_hash: string;
}
export interface FileContent {
    data: string;
    filename: string;
    size: number;
    comment: string;
}
export interface RevisionMetadata_1_2 {
    domain_id: string;
    time_stamp: string;
    previous_verification_hash: string | null;
    metadata_hash: string;
    verification_hash: string;
    merge_hash: string | null;
}
export interface Timestamp {
    seconds: number;
    nanos: number;
}
export interface PageData_1_2 {
    pages: HashChain_1_2[];
}
export declare function getTimestampDirect(pageData: PageData_1_2): string | undefined;
export declare function getTimestampSafe(pageData: PageData_1_2): string | undefined;
export interface RevisionVerificationResult {
    successful: boolean;
    file_verification: ResultStatus;
    content_verification: ResultStatus;
    witness_verification: ResultStatus;
    signature_verification: ResultStatus;
    metadata_verification: ResultStatus;
}
export declare enum ResultStatusEnum {
    MISSING = 0,
    AVAILABLE = 1
}
export interface ResultStatus {
    status: ResultStatusEnum;
    successful: boolean;
    message: string;
}
export interface VerifyFileResult {
    error_message: string | null;
    file_hash: string | null;
}
export interface MerkleNode {
    left_leaf: string;
    right_leaf: string;
    successor: string;
}
export interface CheckEtherScanResult {
    verificationHashMatches: boolean;
    message: string;
    successful: boolean;
}
