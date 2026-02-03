import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { encrypt } from '../cryptor';
import { generateBootstrapFiles } from '../lib/bootstrap';

export interface EncryptOptions {
    inputDir: string;
    outputDir: string;
    password: string;
    title: string;
}

export async function encryptCommand(options: EncryptOptions) {
    const inputDir = path.resolve(options.inputDir);
    const outputDir = path.resolve(options.outputDir);
    const password = options.password;
    const title = options.title;

    if (!fs.existsSync(inputDir)) {
        throw new Error(`Input directory does not exist: ${inputDir}`);
    }

    // Clean/Create output directory
    if (fs.existsSync(outputDir)) {
        throw new Error(`Output directory already exists: ${outputDir}`);
    }

    console.log(`Encrypting from ${inputDir} to ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });

    // Find all files
    const files = await glob('**/*', { cwd: inputDir, nodir: true });

    for (const file of files) {
        const srcPath = path.join(inputDir, file);
        const destPath = path.join(outputDir, file);

        // Create directory structure
        fs.mkdirSync(path.dirname(destPath), { recursive: true });

        const content = fs.readFileSync(srcPath);
        const encrypted = await encrypt(new Uint8Array(content), password);

        fs.writeFileSync(destPath, encrypted);
        console.log(`Encrypted: ${file}`);
    }

    // Generate Bootstrap files (index.html, sw.js)
    generateBootstrapFiles(outputDir, title);

    console.log('Encryption complete!');
}