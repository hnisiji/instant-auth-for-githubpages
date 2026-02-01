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
exports.generateBootstrapFiles = generateBootstrapFiles;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function generateBootstrapFiles(outputDir, title) {
    // 1. Service Worker (sw.js)
    // Structure in dist:
    // dist/
    //   lib/
    //     bootstrap.js
    //   assets/
    //     sw.js
    //     index.html
    // Resolve from dist/lib/bootstrap.js to dist/assets/sw.js
    let swSourcePath = path.resolve(__dirname, '../assets/sw.js');
    if (!fs.existsSync(swSourcePath)) {
        // Check for bundled action structure: dist/index.js -> dist/assets/sw.js
        swSourcePath = path.resolve(__dirname, 'assets/sw.js');
    }
    if (!fs.existsSync(swSourcePath)) {
        // Fallback for development/test environment where structure might be different
        // e.g. packages/cli/src/lib/bootstrap.ts -> packages/cli/dist/assets/sw.js
        swSourcePath = path.resolve(__dirname, '../../dist/assets/sw.js');
    }
    if (!fs.existsSync(swSourcePath)) {
        console.warn(`Warning: Service Worker bundle not found at ${swSourcePath}.`);
    }
    else {
        const swContent = fs.readFileSync(swSourcePath, 'utf-8');
        fs.writeFileSync(path.join(outputDir, 'sw.js'), swContent);
    }
    // 2. Index.html (Login Page)
    // Rename original index.html if exists
    if (fs.existsSync(path.join(outputDir, 'index.html'))) {
        fs.renameSync(path.join(outputDir, 'index.html'), path.join(outputDir, '__index.html'));
    }
    // Resolve from dist/lib/bootstrap.js to dist/assets/index.html
    let htmlTemplatePath = path.resolve(__dirname, '../assets/index.html');
    if (!fs.existsSync(htmlTemplatePath)) {
        // Check for bundled action structure
        htmlTemplatePath = path.resolve(__dirname, 'assets/index.html');
    }
    if (!fs.existsSync(htmlTemplatePath)) {
        // Fallback for development
        htmlTemplatePath = path.resolve(__dirname, '../../dist/assets/index.html');
    }
    if (!fs.existsSync(htmlTemplatePath)) {
        // Fallback to source assets if dist assets not found (e.g. running via ts-node without full build)
        htmlTemplatePath = path.resolve(__dirname, '../../../assets/index.html');
    }
    if (!fs.existsSync(htmlTemplatePath)) {
        throw new Error(`HTML template not found at ${htmlTemplatePath}`);
    }
    let htmlContent = fs.readFileSync(htmlTemplatePath, 'utf-8');
    htmlContent = htmlContent.replace(/{{TITLE}}/g, title);
    fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);
}
