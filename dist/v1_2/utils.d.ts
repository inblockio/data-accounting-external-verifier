import { RevisionContent_1_2, RevisionMetadata_1_2, RevisionSignature_1_2, RevisionWitness_1_2, VerifyFileResult } from "./models";
export declare function getHashSum(content: string): string;
export declare function verifyFileUtil(data: RevisionContent_1_2): [boolean, VerifyFileResult];
export declare function verifyContentUtil(data: RevisionContent_1_2): [boolean, string];
export declare function verifyMetadataUtil(data: RevisionMetadata_1_2): [boolean, string];
export declare function verifySignatureUtil(data: RevisionSignature_1_2, verificationHash: string): [boolean, string];
export declare function verifyWitnessUtil(witnessData: RevisionWitness_1_2, verification_hash: string, doVerifyMerkleProof: boolean): Promise<[boolean, string]>;
export declare const jsonReplacer: (key: string, value: any) => any;
