import * as core from '@actions/core';
import { encryptCommand } from '@instant-lock/cli/dist/commands/encrypt';

async function run() {
  try {
    const inputDir = core.getInput('input-dir');
    const outputDir = core.getInput('output-dir');
    const password = core.getInput('password');
    const title = core.getInput('title');

    await encryptCommand({
      inputDir,
      outputDir,
      password,
      title
    });

  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();