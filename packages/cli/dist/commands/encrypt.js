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
exports.encryptCommand = encryptCommand;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
const cryptor_1 = require("../cryptor");
const bootstrap_1 = require("../lib/bootstrap");
async function encryptCommand(options) {
    const inputDir = path.resolve(options.inputDir);
    const outputDir = path.resolve(options.outputDir);
    const password = options.password;
    const title = options.title;
    console.log(`Encrypting from ${inputDir} to ${outputDir}`);
    // Clean/Create output directory
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
    }
    fs.mkdirSync(outputDir, { recursive: true });
    // Find all files
    const files = await (0, glob_1.glob)('**/*', { cwd: inputDir, nodir: true });
    for (const file of files) {
        const srcPath = path.join(inputDir, file);
        const destPath = path.join(outputDir, file);
        // Create directory structure
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        const content = fs.readFileSync(srcPath);
        const encrypted = await (0, cryptor_1.encrypt)(new Uint8Array(content), password);
        fs.writeFileSync(destPath, encrypted);
        console.log(`Encrypted: ${file}`);
    }
    // Generate Bootstrap files (index.html, sw.js)
    (0, bootstrap_1.generateBootstrapFiles)(outputDir, title);
    console.log('Encryption complete!');
}
