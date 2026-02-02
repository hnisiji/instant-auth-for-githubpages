"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
// Magic Bytes: "IAGP"
const MAGIC_BYTES = new Uint8Array([0x49, 0x41, 0x47, 0x50]);
const SALT_LEN = 16;
const IV_LEN = 12;
const ITERATIONS = 100000;
const KEY_LEN = 256; // bits
const DIGEST = 'SHA-256';
const ALGO_NAME = 'AES-GCM';
// Node.js と Browser の両方で動作するように crypto オブジェクトを取得
// esbuild でバンドルする際、ブラウザ向けビルドでは require('crypto') が解決できずにエラーになるのを防ぐため、
// 動的な require ではなく、条件分岐で完全に切り分けるか、try-catch で囲むなどの対策が必要。
// しかし、esbuild は静的解析で require を見つけるとエラーにする。
// そこで、eval('require') を使うか、外部モジュールとしてマークするなどの回避策があるが、
// ここではブラウザ環境（Service Worker含む）では require が呼ばれないことを前提に、
// バンドラが死なないように記述を工夫する。
let cryptoSubtle;
if (typeof crypto !== 'undefined' && crypto.subtle) {
    cryptoSubtle = crypto.subtle;
}
else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    cryptoSubtle = globalThis.crypto.subtle;
}
else {
    // Node.js environment
    // Use eval('require') to prevent bundlers from trying to bundle 'crypto' for browser builds
    // This is a hack, but effective for dual-mode libraries.
    try {
        // @ts-ignore
        const nodeCrypto = (0, eval)('require')('crypto');
        cryptoSubtle = nodeCrypto.webcrypto.subtle;
    }
    catch (e) {
        // Fallback for environments where require is not available (e.g. browser bundle)
        // In browser, cryptoSubtle should have been set by the first if block.
        // If we are here, it means we are in an environment without global crypto AND without require.
        // This is likely the case when esbuild bundles this code for browser but executes the top-level scope.
        // We can ignore this error here, but subsequent calls to encrypt/decrypt will fail if cryptoSubtle is undefined.
        // However, since we are assigning to a let variable, we need to handle the undefined case later or cast it.
        // For now, let's just leave it undefined and let it fail at runtime if used.
    }
}
// Helper to ensure cryptoSubtle is available
function getSubtle() {
    if (cryptoSubtle)
        return cryptoSubtle;
    throw new Error("Web Crypto API is not available in this environment");
}
async function getKeyMaterial(password) {
    const enc = new TextEncoder();
    return getSubtle().importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
}
async function getKey(keyMaterial, salt) {
    return getSubtle().deriveKey({
        name: "PBKDF2",
        salt: salt,
        iterations: ITERATIONS,
        hash: DIGEST
    }, keyMaterial, { name: ALGO_NAME, length: KEY_LEN }, false, ["encrypt", "decrypt"]);
}
async function encrypt(data, password) {
    // 1. Generate Salt and IV
    const salt = new Uint8Array(SALT_LEN);
    const iv = new Uint8Array(IV_LEN);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(salt);
        crypto.getRandomValues(iv);
    }
    else {
        // Node.js fallback
        try {
            // @ts-ignore
            const nodeCrypto = (0, eval)('require')('crypto');
            nodeCrypto.randomFillSync(salt);
            nodeCrypto.randomFillSync(iv);
        }
        catch (e) {
            throw new Error("Secure random number generator not available");
        }
    }
    // 2. Derive Key
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);
    // 3. Encrypt
    const encryptedContent = await getSubtle().encrypt({
        name: ALGO_NAME,
        iv: iv
    }, key, data);
    // 4. Concat: [MagicBytes] + [Salt] + [IV] + [Encrypted]
    const encryptedBytes = new Uint8Array(encryptedContent);
    const result = new Uint8Array(MAGIC_BYTES.length + salt.length + iv.length + encryptedBytes.length);
    result.set(MAGIC_BYTES, 0);
    result.set(salt, MAGIC_BYTES.length);
    result.set(iv, MAGIC_BYTES.length + salt.length);
    result.set(encryptedBytes, MAGIC_BYTES.length + salt.length + iv.length);
    return result;
}
async function decrypt(data, password) {
    // 1. Check Magic Bytes
    if (data.length < MAGIC_BYTES.length) {
        return data; // Too short, treat as plain
    }
    for (let i = 0; i < MAGIC_BYTES.length; i++) {
        if (data[i] !== MAGIC_BYTES[i]) {
            return data; // Not encrypted
        }
    }
    // 2. Extract Salt, IV, Encrypted Body
    const saltStart = MAGIC_BYTES.length;
    const ivStart = saltStart + SALT_LEN;
    const bodyStart = ivStart + IV_LEN;
    if (data.length < bodyStart) {
        throw new Error("Invalid encrypted data format: too short");
    }
    const salt = data.slice(saltStart, ivStart);
    const iv = data.slice(ivStart, bodyStart);
    const encryptedBody = data.slice(bodyStart);
    // 3. Derive Key
    const keyMaterial = await getKeyMaterial(password);
    const key = await getKey(keyMaterial, salt);
    // 4. Decrypt
    try {
        const decryptedContent = await getSubtle().decrypt({
            name: ALGO_NAME,
            iv: iv
        }, key, encryptedBody);
        return new Uint8Array(decryptedContent);
    }
    catch (e) {
        throw new Error("Decryption failed. Wrong password?");
    }
}
