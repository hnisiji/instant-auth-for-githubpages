"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
// Magic Bytes: "IAGP"
var MAGIC_BYTES = new Uint8Array([0x49, 0x41, 0x47, 0x50]);
var SALT_LEN = 16;
var IV_LEN = 12;
var ITERATIONS = 100000;
var KEY_LEN = 256; // bits
var DIGEST = 'SHA-256';
var ALGO_NAME = 'AES-GCM';
// Node.js と Browser の両方で動作するように crypto オブジェクトを取得
// esbuild でバンドルする際、ブラウザ向けビルドでは require('crypto') が解決できずにエラーになるのを防ぐため、
// 動的な require ではなく、条件分岐で完全に切り分けるか、try-catch で囲むなどの対策が必要。
// しかし、esbuild は静的解析で require を見つけるとエラーにする。
// そこで、eval('require') を使うか、外部モジュールとしてマークするなどの回避策があるが、
// ここではブラウザ環境（Service Worker含む）では require が呼ばれないことを前提に、
// バンドラが死なないように記述を工夫する。
var cryptoSubtle;
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
        var nodeCrypto = (0, eval)('require')('crypto');
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
function getKeyMaterial(password) {
    return __awaiter(this, void 0, void 0, function () {
        var enc;
        return __generator(this, function (_a) {
            enc = new TextEncoder();
            return [2 /*return*/, getSubtle().importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"])];
        });
    });
}
function getKey(keyMaterial, salt) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, getSubtle().deriveKey({
                    name: "PBKDF2",
                    salt: salt,
                    iterations: ITERATIONS,
                    hash: DIGEST
                }, keyMaterial, { name: ALGO_NAME, length: KEY_LEN }, false, ["encrypt", "decrypt"])];
        });
    });
}
function encrypt(data, password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, iv, nodeCrypto, keyMaterial, key, encryptedContent, encryptedBytes, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = new Uint8Array(SALT_LEN);
                    iv = new Uint8Array(IV_LEN);
                    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
                        crypto.getRandomValues(salt);
                        crypto.getRandomValues(iv);
                    }
                    else {
                        // Node.js fallback
                        try {
                            nodeCrypto = (0, eval)('require')('crypto');
                            nodeCrypto.randomFillSync(salt);
                            nodeCrypto.randomFillSync(iv);
                        }
                        catch (e) {
                            throw new Error("Secure random number generator not available");
                        }
                    }
                    return [4 /*yield*/, getKeyMaterial(password)];
                case 1:
                    keyMaterial = _a.sent();
                    return [4 /*yield*/, getKey(keyMaterial, salt)];
                case 2:
                    key = _a.sent();
                    return [4 /*yield*/, getSubtle().encrypt({
                            name: ALGO_NAME,
                            iv: iv
                        }, key, data)];
                case 3:
                    encryptedContent = _a.sent();
                    encryptedBytes = new Uint8Array(encryptedContent);
                    result = new Uint8Array(MAGIC_BYTES.length + salt.length + iv.length + encryptedBytes.length);
                    result.set(MAGIC_BYTES, 0);
                    result.set(salt, MAGIC_BYTES.length);
                    result.set(iv, MAGIC_BYTES.length + salt.length);
                    result.set(encryptedBytes, MAGIC_BYTES.length + salt.length + iv.length);
                    return [2 /*return*/, result];
            }
        });
    });
}
function decrypt(data, password) {
    return __awaiter(this, void 0, void 0, function () {
        var i, saltStart, ivStart, bodyStart, salt, iv, encryptedBody, keyMaterial, key, decryptedContent, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 1. Check Magic Bytes
                    if (data.length < MAGIC_BYTES.length) {
                        return [2 /*return*/, data]; // Too short, treat as plain
                    }
                    for (i = 0; i < MAGIC_BYTES.length; i++) {
                        if (data[i] !== MAGIC_BYTES[i]) {
                            return [2 /*return*/, data]; // Not encrypted
                        }
                    }
                    saltStart = MAGIC_BYTES.length;
                    ivStart = saltStart + SALT_LEN;
                    bodyStart = ivStart + IV_LEN;
                    if (data.length < bodyStart) {
                        throw new Error("Invalid encrypted data format: too short");
                    }
                    salt = data.slice(saltStart, ivStart);
                    iv = data.slice(ivStart, bodyStart);
                    encryptedBody = data.slice(bodyStart);
                    return [4 /*yield*/, getKeyMaterial(password)];
                case 1:
                    keyMaterial = _a.sent();
                    return [4 /*yield*/, getKey(keyMaterial, salt)];
                case 2:
                    key = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, getSubtle().decrypt({
                            name: ALGO_NAME,
                            iv: iv
                        }, key, encryptedBody)];
                case 4:
                    decryptedContent = _a.sent();
                    return [2 /*return*/, new Uint8Array(decryptedContent)];
                case 5:
                    e_1 = _a.sent();
                    throw new Error("Decryption failed. Wrong password?");
                case 6: return [2 /*return*/];
            }
        });
    });
}
