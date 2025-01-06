import * as formatter from "./formatter.js";
declare const apiVersion = "0.3.0";
declare const ERROR_VERIFICATION_STATUS = "ERROR";
declare const dict2Leaves: (obj: any) => any[];
declare function getHashSum(content: string): any;
declare const getFileHashSum: (filename: any) => any;
declare function readExportFile(filename: any): Promise<any>;
declare function generateVerifyPage(verificationHashes: any, aquaObject: any, verbose: boolean | undefined, doVerifyMerkleProof: boolean): AsyncGenerator<(boolean | {
    scalar: boolean;
    verification_hash: string;
    status: {
        verification: string;
        type_ok: boolean;
    };
    witness_result: {};
    file_hash: string;
    data: any;
    revision_type: any;
})[] | {}[], void, unknown>;
declare function verifyPage(input: any, verbose: any, doVerifyMerkleProof: any): Promise<any[]>;
declare function checkAPIVersionCompatibility(server: any): Promise<any[]>;
export { generateVerifyPage, verifyPage, apiVersion, ERROR_VERIFICATION_STATUS, dict2Leaves, getHashSum, getFileHashSum, formatter, checkAPIVersionCompatibility, readExportFile, };
