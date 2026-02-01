#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const encrypt_1 = require("./commands/encrypt");
const program = new commander_1.Command();
program
    .name('instant-lock')
    .description('CLI to encrypt static sites')
    .version('1.0.0');
program.command('encrypt')
    .description('Encrypts a directory')
    .requiredOption('-i, --input-dir <path>', 'Input directory')
    .requiredOption('-o, --output-dir <path>', 'Output directory')
    .requiredOption('-p, --password <password>', 'Password for encryption')
    .option('-t, --title <title>', 'Title for the login page', 'Restricted Area')
    .action(async (options) => {
    await (0, encrypt_1.encryptCommand)(options);
});
program.parse(process.argv);
