interface HashChain {
    genesis_hash: string;
    domain_id: string;
    title: string;
    DateFormatter: any;
    namespace: number;
    chain_height: number;
    revisions: Record<string, Revision>;
}
interface StructuredMerkleProof {
    left_leaf: string;
    right_leaf: string;
    successor: string;
}
interface RevisionWitness {
    domain_snapshot_genesis_hash: string;
    merkle_root: string;
    witness_network: string;
    witness_event_transaction_hash: string;
    witness_event_verification_hash: string;
    witness_hash: string;
    structured_merkle_proof: StructuredMerkleProof[];
}
interface RevisionSignature {
    signature: string;
    public_key: string;
    signature_hash: string;
    wallet_address: string;
}
interface Revision {
    content: RevisionContent;
    metadata: RevisionMetadata;
    signature: RevisionSignature | null;
    witness: RevisionWitness | null;
}
interface RevisionContent {
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
interface RevisionMetadata {
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
interface PageData {
    pages: HashChain[];
}
declare function getTimestampDirect(pageData: PageData): string | undefined;
declare function getTimestampSafe(pageData: PageData): string | undefined;
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
    alchemyKey: string;
    doAlchemyKeyLookUp: boolean;
}
declare class AquaVerifier {
    private options;
    constructor(options?: VerificationOptions);
    fetchVerificationOptions(): VerificationOptions;
    verifyRevision(revision: Revision): Promise<RevisionVerificationResult>;
    verifySignature(signature: RevisionSignature, previous_hash: string): ResultStatus | null;
    verifyWitness(witness: RevisionWitness, verification_hash: string, doVerifyMerkleProof: boolean): Promise<ResultStatus>;
    verifyMerkleTree(): void;
    verifyAquaChain(hashChain: HashChain): Promise<RevisionAquaChainResult>;
}

export { type CheckEtherScanResult, type FileContent, type HashChain, type MerkleNode, type PageData, type ResultStatus, ResultStatusEnum, type Revision, type RevisionAquaChainResult, type RevisionContent, type RevisionMetadata, type RevisionSignature, type RevisionVerificationResult, type RevisionWitness, type StructuredMerkleProof, type Timestamp, type VerificationOptions, type VerifyFileResult, AquaVerifier as default, getTimestampDirect, getTimestampSafe };
