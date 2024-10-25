interface Revision {
}
interface RevisionSignature {
}
interface RevisionWitness {
}
interface HashChain {
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
    verifyAquaChain(hashChain: HashChain): Promise<any> | null;
}

export { AquaVerifier };
