import { HashChain, Revision, RevisionSignature, RevisionWitness } from "./models/models";
import { HashChain_1_2, PageData_1_2, Revision_1_2, RevisionSignature_1_2, RevisionVerificationResult, RevisionWitness_1_2 } from "./v1_2/models";
import { verifyAquaChain, verifyRevision, verifySignature, verifyWitness } from "./v1_2/v1_2";


export interface VerificationOptions {
    version: number;
    strict?: boolean;
    allowNull?: boolean;
    customMessages?: Record<string, string>;
}


export class AquaVerifier {

    private options: VerificationOptions;

    constructor(options: VerificationOptions = { version: 1.2 }) {
        // if (options.version !== 1.2) {
        //     throw new Error("Unsupported Version");
        // }

        this.options = {
            strict: false,
            allowNull: false,
            customMessages: {},
            ...options
        };
    }


    public fetchVerificationOptions() {
        return this.options
    }

    public verifyRevision(revision: Revision): Promise<RevisionVerificationResult> | null {
        if (this.options.version == 1.2) {
            return verifyRevision(revision as Revision_1_2)
        }
        return null
    }

    public verifySignature(signature: RevisionSignature, previous_hash: string) {
        if (this.options.version == 1.2) {
            return verifySignature(signature as RevisionSignature_1_2, previous_hash)
        }
        return null
    }

    public verifyWitness(witness: RevisionWitness, verification_hash: string,
        doVerifyMerkleProof: boolean) {
        if (this.options.version == 1.2) {
            return verifyWitness(witness as RevisionWitness_1_2, verification_hash, doVerifyMerkleProof)
        }
        return null
    }

    // TODO: Fix: verifier can't sign nor witness files. So this two methods might be out of place here because the verifier is verify AQUA Chain
    // public signFile() {

    // }

    // public witnessFile() {

    // }

    public verifyMerkleTree() {

    }

    public verifyAquaChain(hashChain: HashChain): Promise<any> | null {
        if (this.options.version == 1.2) {
            return verifyAquaChain(hashChain as HashChain_1_2)
        }
        return null
    }
}