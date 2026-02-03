#!/usr/bin/env node
import { Command } from 'commander';
import { encryptCommand } from './commands/encrypt';

const program = new Command();

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
      try {
          await encryptCommand(options);
      } catch (e) {
          console.error(`Error: ${(e as Error).message}`);
      }
  });

program.parse(process.argv);
