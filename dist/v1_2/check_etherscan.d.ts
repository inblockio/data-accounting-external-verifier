import { CheckEtherScanResult } from "./models";
declare const witnessNetworkMap: Record<string, string>;
declare function checkEtherScan(witnessNetwork: string, txHash: string, witnessVerificationHash: string): Promise<CheckEtherScanResult>;
export { checkEtherScan, witnessNetworkMap };
