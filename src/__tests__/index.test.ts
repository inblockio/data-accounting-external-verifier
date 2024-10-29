import AquaVerifier from '../index';
import * as fs from 'fs';
import * as path from 'path';
import { PageData } from '../models/models';


describe('Aqua Verifier Tests', () => {
    let verifier: AquaVerifier;

    beforeEach(() => {
        verifier = new AquaVerifier({ version: 1.2, alchemyKey: "----", alchemyLookUp: false });
    });

    test('getInformation', () => {
        expect(verifier.fetchVerificationOptions().version).toBe(1.2);
    });

    test('Should instantiate the AquaVerifier class', () => {
        expect(verifier).toBeInstanceOf(AquaVerifier);
    });

    test('Should verify with signature and witness from JSON file', async() => {
        const filePath = path.resolve(__dirname, 'sample_with_signature_and_witness.json');
        const aquaChain: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const result = await verifier.verifyAquaChain(aquaChain.pages[0]); // Adjust based on your actual method
        
        expect(result).not.toBeNull();

        // check if general successful
        expect(result?.successful).toBe(true); 

    });

    test('Should verify without signature and witness from JSON file',async () => {
        const filePath = path.resolve(__dirname, 'sample_without_signature_and_witness.json');
        const aquaChain: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        const result = await verifier.verifyRevision(aquaChain.pages[0].revisions[revisionHashes[0]]); // Adjust based on your actual method
        
        expect(result).not.toBeNull();

        //check if general successful
        expect(result?.successful).toBe(true); 

    });

    test('Should verify signature  only from JSON file', () => {
        const filePath = path.resolve(__dirname, 'sample_with_signature_only.json');
        const aquaChain: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        const result = verifier.verifySignature(aquaChain.pages[0].revisions[revisionHashes[1]].signature!!,aquaChain.pages[0].revisions[revisionHashes[1]].metadata.previous_verification_hash!! ); // Adjust based on your actual method
        expect(result).not.toBeNull();

        //check if general successful
        expect(result?.successful).toBe(true); 
        
    });

    test('Should verify witness only from JSON file', async () => {
        const filePath = path.resolve(__dirname, 'sample_with_witness_only.json');
        const aquaChain: PageData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const revisionHashes = Object.keys(aquaChain.pages[0].revisions)
        const result =  await verifier.verifyWitness(
            aquaChain.pages[0].revisions[revisionHashes[1]].witness!!,
            aquaChain.pages[0].revisions[revisionHashes[1]].metadata.previous_verification_hash!! , 
            false); // Adjust based on your actual method
            
        expect(result).not.toBeNull();

        //check if general successful
        expect(result?.successful).toBe(true); 
        
    });

    // We cannot directly test from jest because ethers requires one to be really connected to some network ie localhost or you are on production live link
    // test('Check etherscan', async () => {
    //     const result = await checkTransaction("sepolia", "0x72f1af326031c0889ec87d544e1d36d69c10d3f25ba32c72006dd004b4eadb24", "f6b074d63b2dd82ecc709f7e6ef66b9c39ea72d579e517b1b5be8fa7db824c23acbc90c8d846010819cf7281c0fb62e620728a58e8a85e2f185473fb36d50739")
    //     console.log("Result: ", result)
    //     // expect(result).not.toBeNull();

    //     // //check if general successful
    //     // expect(result?.successful).toBe(true); 
        
    // }, 20000);

});