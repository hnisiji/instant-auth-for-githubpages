import { encrypt, decrypt } from './index';

describe('Cryptor', () => {
    const password = 'my-secret-password';
    const plainText = 'Hello, World!';
    const enc = new TextEncoder();
    const dec = new TextDecoder();

    it('should encrypt and decrypt correctly', async () => {
        const data = enc.encode(plainText);
        const encrypted = await encrypt(data, password);
        
        expect(encrypted).not.toEqual(data);
        expect(encrypted.length).toBeGreaterThan(data.length);

        const decrypted = await decrypt(encrypted, password);
        expect(dec.decode(decrypted)).toBe(plainText);
    });

    it('should return original data if not encrypted (no magic bytes)', async () => {
        const data = enc.encode(plainText);
        // decrypt should return data as is if it doesn't start with magic bytes
        const result = await decrypt(data, password);
        expect(dec.decode(result)).toBe(plainText);
    });

    it('should fail with wrong password', async () => {
        const data = enc.encode(plainText);
        const encrypted = await encrypt(data, password);
        
        await expect(decrypt(encrypted, 'wrong-password')).rejects.toThrow();
    });
});