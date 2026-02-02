"use strict";
/// <reference lib="webworker" />
Object.defineProperty(exports, "__esModule", { value: true });
const cryptor_1 = require("../cryptor");
let password = null;
// MIME Types mapping
const MIME_TYPES = {
    'html': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'eot': 'application/vnd.ms-fontobject',
    'txt': 'text/plain',
    'xml': 'application/xml',
    'pdf': 'application/pdf'
};
self.addEventListener('install', (event) => {
    self.skipWaiting();
});
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_PASSWORD') {
        password = event.data.password;
        // Respond to confirm
        if (event.source) {
            event.source.postMessage({ type: 'PASSWORD_SET' });
        }
    }
});
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    // Only intercept requests to our origin
    if (url.origin !== self.location.origin) {
        return;
    }
    // Bypass for sw.js itself and the bootstrap index.html (if we are not authenticated)
    // Actually, if we are authenticated, we want to serve the decrypted content.
    // If not authenticated, we should probably let the browser load the bootstrap index.html
    // But wait, the bootstrap index.html is physically on the disk as 'index.html'.
    // The encrypted content is '__index.html'.
    // If password is not set, we can't decrypt anyway.
    if (!password) {
        return;
    }
    // If it's a navigation request to root, we want to serve __index.html decrypted
    let path = url.pathname;
    if (path === '/' || path === '/index.html') {
        path = '/__index.html';
    }
    event.respondWith((async () => {
        try {
            // Fetch the encrypted resource
            const response = await fetch(path);
            if (!response.ok) {
                // If __index.html doesn't exist (maybe it wasn't renamed?), fallback to original response
                return response;
            }
            const buffer = await response.arrayBuffer();
            const data = new Uint8Array(buffer);
            // Decrypt
            const decrypted = await (0, cryptor_1.decrypt)(data, password);
            // Determine Content-Type
            let contentType = 'application/octet-stream';
            const ext = path.split('.').pop()?.toLowerCase();
            if (ext && MIME_TYPES[ext]) {
                contentType = MIME_TYPES[ext];
            }
            return new Response(decrypted, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'no-store' // Don't cache decrypted content
                }
            });
        }
        catch (e) {
            console.error('Decryption failed or fetch error', e);
            // Fallback to original response (might be 404 or encrypted garbage)
            return fetch(event.request);
        }
    })());
});
