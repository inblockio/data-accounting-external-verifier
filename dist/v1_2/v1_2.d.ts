import { ResultStatus, Revision_1_2, RevisionSignature_1_2, RevisionVerificationResult, RevisionWitness_1_2, HashChain_1_2 } from "./models";
export declare function verifyRevision(revision: Revision_1_2): Promise<RevisionVerificationResult>;
export declare function verifySignature(signature: RevisionSignature_1_2, previous_verification_hash: string): ResultStatus;
export declare function verifyWitness(witness: RevisionWitness_1_2, verification_hash: string, doVerifyMerkleProof: boolean): Promise<ResultStatus>;
export declare function verifyAquaChain(aquaChain: HashChain_1_2): Promise<any>;
