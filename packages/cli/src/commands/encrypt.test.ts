import * as fs from 'fs';
import * as path from 'path';
import { encryptCommand } from './encrypt';
import { decrypt } from '@instant-lock/cryptor';

const TEST_DIR = path.join(__dirname, 'temp_test_dir');
const INPUT_DIR = path.join(TEST_DIR, 'input');
const OUTPUT_DIR = path.join(TEST_DIR, 'output');
const PASSWORD = 'testpassword';

describe('encryptCommand', () => {
    beforeEach(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(INPUT_DIR, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
    });

    it('should encrypt files and generate bootstrap files', async () => {
        // Create dummy files
        fs.writeFileSync(path.join(INPUT_DIR, 'index.html'), '<h1>Hello</h1>');
        fs.writeFileSync(path.join(INPUT_DIR, 'style.css'), 'body { color: red; }');
        fs.mkdirSync(path.join(INPUT_DIR, 'subdir'));
        fs.writeFileSync(path.join(INPUT_DIR, 'subdir/script.js'), 'console.log("hi");');

        await encryptCommand({
            inputDir: INPUT_DIR,
            outputDir: OUTPUT_DIR,
            password: PASSWORD,
            title: 'Test Site'
        });

        // Check if output directory exists
        expect(fs.existsSync(OUTPUT_DIR)).toBe(true);

        // Check bootstrap files
        expect(fs.existsSync(path.join(OUTPUT_DIR, 'index.html'))).toBe(true); // Login page
        expect(fs.existsSync(path.join(OUTPUT_DIR, 'sw.js'))).toBe(true); // Service Worker

        // Check encrypted files
        expect(fs.existsSync(path.join(OUTPUT_DIR, '__index.html'))).toBe(true); // Renamed original index
        expect(fs.existsSync(path.join(OUTPUT_DIR, 'style.css'))).toBe(true);
        expect(fs.existsSync(path.join(OUTPUT_DIR, 'subdir/script.js'))).toBe(true);

        // Verify encryption content (try to decrypt)
        const encryptedContent = fs.readFileSync(path.join(OUTPUT_DIR, '__index.html'));
        const decryptedContent = await decrypt(new Uint8Array(encryptedContent), PASSWORD);
        const decryptedString = new TextDecoder().decode(decryptedContent);
        
        expect(decryptedString).toBe('<h1>Hello</h1>');
    });
});