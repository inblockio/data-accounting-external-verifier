import { AquaVerifier } from '../index';

// describe('AquaVerifier', () => {
//     let verifier: AquaVerifier;
//
//     beforeEach(() => {
//         verifier = new AquaVerifier();
//     });
//
//     describe('isString', () => {
//         it('should validate strings correctly', () => {
//             expect(verifier.isString('test').isValid).toBe(true);
//             expect(verifier.isString(123).isValid).toBe(false);
//         });
//     });
//
//     describe('isNumber', () => {
//         it('should validate numbers correctly', () => {
//             expect(verifier.isNumber(123).isValid).toBe(true);
//             expect(verifier.isNumber('123').isValid).toBe(false);
//         });
//     });
//
//     describe('isEmail', () => {
//         it('should validate email addresses correctly', () => {
//             expect(verifier.isEmail('test@example.com').isValid).toBe(true);
//             expect(verifier.isEmail('invalid-email').isValid).toBe(false);
//         });
//     });
// });