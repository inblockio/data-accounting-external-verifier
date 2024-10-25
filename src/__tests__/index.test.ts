import { AquaVerifier } from '../index';
import * as fs from 'fs';
import * as path from 'path';
import { PageData_1_2 } from '../v1_2/models';


describe('Aqua Verifier Tests', () => {
    let verifier: AquaVerifier;

    beforeEach(() => {
        verifier = new AquaVerifier({ version: 1.2 });
    });

    test('getInformation', () => {
        expect(verifier.fetchVerificationOptions().version).toBe(1.2);
    });

    test('Should instantiate the AquaVerifier class', () => {
        expect(verifier).toBeInstanceOf(AquaVerifier);
    });

    test('Should verify with signature and witness from JSON file', async() => {
        const filePath = path.resolve(__dirname, 'sample_with_signature_and_witness.json');
        const aquaChain: PageData_1_2 = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const result = await verifier.verifyAquaChain(aquaChain.pages[0]); // Adjust based on your actual method
        
        expect(result).not.toBeNull();

        // check if general successful
        expect(result?.successful).toBe(true); 

    });

    test('Should verify without signature and witness from JSON file',async () => {
        const filePath = path.resolve(__dirname, 'sample_without_signature_and_witness.json');
        const aquaChain: PageData_1_2 = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        const result = await verifier.verifyRevision(aquaChain.pages[0].revisions[revisionHashes[0]]); // Adjust based on your actual method
        
        expect(result).not.toBeNull();

        //check if general successful
        expect(result?.successful).toBe(true); 

    });

    test('Should verify signature  only from JSON file', () => {
        const filePath = path.resolve(__dirname, 'sample_with_signature_only.json');
        const aquaChain: PageData_1_2 = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        const result = verifier.verifySignature(aquaChain.pages[0].revisions[revisionHashes[1]].signature!!,aquaChain.pages[0].revisions[revisionHashes[1]].metadata.previous_verification_hash!! ); // Adjust based on your actual method
        expect(result).not.toBeNull();

        //check if general successful
        expect(result?.successful).toBe(true); 
        
    });

    test('Should verify witness only from JSON file', async () => {
        const filePath = path.resolve(__dirname, 'sample_with_witness_only.json');
        const aquaChain: PageData_1_2 = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        const result =  await verifier.verifyWitness(
            aquaChain.pages[0].revisions[revisionHashes[1]].witness!!,
            aquaChain.pages[0].revisions[revisionHashes[1]].metadata.previous_verification_hash!! , 
            false); // Adjust based on your actual method
            
        expect(result).not.toBeNull();

        //check if general successful
        expect(result?.successful).toBe(true); 
        
    });
});