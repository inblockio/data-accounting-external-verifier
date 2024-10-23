import { Revision } from "./models/models";
import { Revision_1_2 } from "./v1_2/models";
import { verifyRevision } from "./v1_2/v1_2";


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

    public verifyRevision(revision: Revision){
        if(this.options.version == 1.2){
            verifyRevision(revision as Revision_1_2)
        }
    }

    public verifySignature() {

    }

    public verifyWitness() {

    }

    public signFile() {

    }

    public witnessFile() {

    }

    public verifyMerkleTree() {

    }

    public verifyAquaChain() {

    }
}