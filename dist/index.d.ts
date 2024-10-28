interface Revision {
}
interface RevisionSignature {
}
interface RevisionWitness {
}
interface HashChain {
}

interface HashChain_1_2 extends HashChain {
    genesis_hash: string;
    domain_id: string;
    title: string;
    DateFormatter: any;
    namespace: number;
    chain_height: number;
    revisions: Record<string, Revision_1_2>;
}
interface StructuredMerkleProof {
    left_leaf: string;
    right_leaf: string;
    successor: string;
}
interface RevisionWitness_1_2 {
    domain_snapshot_genesis_hash: string;
    merkle_root: string;
    witness_network: string;
    witness_event_transaction_hash: string;
    witness_event_verification_hash: string;
    witness_hash: string;
    structured_merkle_proof: StructuredMerkleProof[];
}
interface RevisionSignature_1_2 extends RevisionSignature {
    signature: string;
    public_key: string;
    signature_hash: string;
    wallet_address: string;
}
interface Revision_1_2 extends Revision {
    content: RevisionContent_1_2;
    metadata: RevisionMetadata_1_2;
    signature: RevisionSignature_1_2 | null;
    witness: RevisionWitness_1_2 | null;
}
interface RevisionContent_1_2 {
    file: FileContent | null;
    content: {
        file_hash?: string;
        [key: string]: string | undefined;
    };
    content_hash: string;
}
interface FileContent {
    data: string;
    filename: string;
    size: number;
    comment: string;
}
interface RevisionMetadata_1_2 {
    domain_id: string;
    time_stamp: string;
    previous_verification_hash: string | null;
    metadata_hash: string;
    verification_hash: string;
    merge_hash: string | null;
}
interface Timestamp {
    seconds: number;
    nanos: number;
}
interface PageData_1_2 {
    pages: HashChain_1_2[];
}
declare function getTimestampDirect(pageData: PageData_1_2): string | undefined;
declare function getTimestampSafe(pageData: PageData_1_2): string | undefined;
interface RevisionAquaChainResult {
    successful: boolean;
    revisionResults: Array<RevisionVerificationResult>;
}
interface RevisionVerificationResult {
    successful: boolean;
    file_verification: ResultStatus;
    content_verification: ResultStatus;
    witness_verification: ResultStatus;
    signature_verification: ResultStatus;
    metadata_verification: ResultStatus;
}
declare enum ResultStatusEnum {
    MISSING = 0,
    AVAILABLE = 1
}
interface ResultStatus {
    status: ResultStatusEnum;
    successful: boolean;
    message: string;
}
interface VerifyFileResult {
    error_message: string | null;
    file_hash: string | null;
}
interface MerkleNode {
    left_leaf: string;
    right_leaf: string;
    successor: string;
}
interface CheckEtherScanResult {
    verificationHashMatches: boolean;
    message: string;
    successful: boolean;
}

interface VerificationOptions {
    version: number;
    strict?: boolean;
    allowNull?: boolean;
    customMessages?: Record<string, string>;
}
declare class AquaVerifier {
    private options;
    constructor(options?: VerificationOptions);
    fetchVerificationOptions(): VerificationOptions;
    verifyRevision(revision: Revision): Promise<RevisionVerificationResult> | null;
    verifySignature(signature: RevisionSignature, previous_hash: string): ResultStatus | null;
    verifyWitness(witness: RevisionWitness, verification_hash: string, doVerifyMerkleProof: boolean): Promise<ResultStatus> | null;
    verifyMerkleTree(): void;
    verifyAquaChain(hashChain: HashChain): Promise<RevisionAquaChainResult> | null;
}

export { AquaVerifier, type CheckEtherScanResult, type FileContent, type HashChain, type HashChain_1_2, type MerkleNode, type PageData_1_2, type ResultStatus, ResultStatusEnum, type Revision, type RevisionAquaChainResult, type RevisionContent_1_2, type RevisionMetadata_1_2, type RevisionSignature, type RevisionSignature_1_2, type RevisionVerificationResult, type RevisionWitness, type RevisionWitness_1_2, type Revision_1_2, type StructuredMerkleProof, type Timestamp, type VerifyFileResult, getTimestampDirect, getTimestampSafe };
