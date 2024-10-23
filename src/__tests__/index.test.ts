import { AquaVerifier } from '../index';

import * as fs from 'fs';
import * as path from 'path';
import { PageData } from '../v1_2/models';

describe('AquaVerifier', () => {
    let verifier: AquaVerifier;

    beforeEach(() => {
        verifier = new AquaVerifier({ version: 1.2 });
    });

    describe('getInformation', () => {
        it('Version should be 1.2', () => {
            expect(verifier.fetchVerificationOptions().version).toBe(1.2);
            // expect(verifier.isString(123).isValid).toBe(false);
        });
    });

    test('should instantiate the AquaVerifier class', () => {
        expect(verifier).toBeInstanceOf(AquaVerifier);
    });

    test('should verify revision from JSON file', () => {
        const filePath = path.resolve(__dirname, 'sample_without_signature.json');
        const aquaChain: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        // console.log(JSON.stringify(aquaChain, null, 4))
        const result = verifier.verifyRevision(aquaChain.pages[0].revisions[revisionHashes[0]]); // Adjust based on your actual method
        console.log(result)
        // expect(result).toBe(true); // Adjust based on actual verification logic
    });

    test('should verify revision from JSON file', () => {
        const filePath = path.resolve(__dirname, 'sample_with_signature_and_witness.json');
        const aquaChain: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        // console.log(JSON.stringify(aquaChain, null, 4))
        const result = verifier.verifyRevision(aquaChain.pages[0].revisions[revisionHashes[0]]); // Adjust based on your actual method
        console.log(result)
        // expect(result).toBe(true); // Adjust based on actual verification logic
    });

});