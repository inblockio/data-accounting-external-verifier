
export interface VerificationOptions {
    version:number ;
    strict?: boolean;
    allowNull?: boolean;
    customMessages?: Record<string, string>;
}
export class AquaVerifier {

    private options: VerificationOptions;

    constructor(options: VerificationOptions = {version: 1.2}) {
        this.options = {
            strict: false,
            allowNull: false,
            customMessages: {},
            ...options
        };
    }
}