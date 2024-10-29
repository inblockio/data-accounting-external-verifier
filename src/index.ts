import { verifyAquaChain, verifyRevision, verifySignature, verifyWitness } from "./aquaVerifier";
import { HashChain, Revision, RevisionAquaChainResult, RevisionSignature, RevisionVerificationResult, RevisionWitness } from "./models/models";

export interface VerificationOptions {
    version: number;
    strict?: boolean;
    allowNull?: boolean;
    customMessages?: Record<string, string>;
    alchemyKey: string,
    doAlchemyKeyLookUp: boolean
}


export default class AquaVerifier {

    private options: VerificationOptions;

    constructor(options: VerificationOptions = { version: 1.2, alchemyKey: "", doAlchemyKeyLookUp: false }) {


        this.options = {
            ...options,
            strict: false,
            allowNull: false,
            customMessages: {},
        };
    }


    public fetchVerificationOptions() {
        return this.options
    }

    public verifyRevision(revision: Revision): Promise<RevisionVerificationResult> {
        if (this.options.doAlchemyKeyLookUp && this.options.alchemyKey === "") {
            throw new Error("ALCHEMY KEY NOT SET");
        }
        return verifyRevision(revision as Revision, this.options.alchemyKey, this.options.doAlchemyKeyLookUp)

    }

    public verifySignature(signature: RevisionSignature, previous_hash: string) {
        if (this.options.version == 1.2) {
            return verifySignature(signature as RevisionSignature, previous_hash)
        }
        return null
    }

    public verifyWitness(witness: RevisionWitness, verification_hash: string,
        doVerifyMerkleProof: boolean) {
        if (this.options.doAlchemyKeyLookUp && this.options.alchemyKey === "") {
            throw new Error("ALCHEMY KEY NOT SET");
        }
        return verifyWitness(witness as RevisionWitness, verification_hash, doVerifyMerkleProof, this.options.alchemyKey, this.options.doAlchemyKeyLookUp)

    }

    // TODO: Fix: verifier can't sign nor witness files. So this two methods might be out of place here because the verifier is verify AQUA Chain
    // public signFile() {

    // }

    // public witnessFile() {

    // }

    public verifyMerkleTree() {
        throw new Error("Unimplmeneted error .... ");

    }

    public verifyAquaChain(hashChain: HashChain): Promise<RevisionAquaChainResult> {
        if (this.options.doAlchemyKeyLookUp && this.options.alchemyKey === "") {
            throw new Error("ALCHEMY KEY NOT SET");
        }

        return verifyAquaChain(hashChain as HashChain, this.options.alchemyKey, this.options.doAlchemyKeyLookUp)

    }
}

