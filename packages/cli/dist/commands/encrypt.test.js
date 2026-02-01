"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const encrypt_1 = require("./encrypt");
const cryptor_1 = require("@instant-lock/cryptor");
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
        await (0, encrypt_1.encryptCommand)({
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
        const decryptedContent = await (0, cryptor_1.decrypt)(new Uint8Array(encryptedContent), PASSWORD);
        const decryptedString = new TextDecoder().decode(decryptedContent);
        expect(decryptedString).toBe('<h1>Hello</h1>');
    });
});
