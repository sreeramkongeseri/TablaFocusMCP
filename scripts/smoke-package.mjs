import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawn, spawnSync } from 'node:child_process';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    ...options,
  });

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}\n${output}`.trim());
  }

  return (result.stdout ?? '').trim();
}

async function assertPackageStarts(workingDir) {
  await new Promise((resolve, reject) => {
    const server = spawn(npxCmd, ['--yes', 'tablafocus-mcp'], {
      cwd: workingDir,
      env: { ...process.env, TABLA_MCP_LOG_LEVEL: 'error' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stderr = '';
    let exited = false;

    server.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    server.on('error', (error) => {
      reject(error);
    });

    server.on('exit', () => {
      exited = true;
    });

    globalThis.setTimeout(() => {
      if (exited) {
        reject(new Error(`Packaged server exited unexpectedly during startup.\n${stderr}`.trim()));
        return;
      }

      server.kill('SIGTERM');
      globalThis.setTimeout(resolve, 250);
    }, 1500);
  });
}

async function main() {
  const repoRoot = process.cwd();
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tablafocus-mcp-smoke-'));
  let tarballPath = '';

  try {
    const packOutput = run(npmCmd, ['pack'], { cwd: repoRoot });
    const tarball = packOutput.split('\n').filter(Boolean).pop();

    if (!tarball) {
      throw new Error('Unable to determine tarball name from npm pack output.');
    }

    tarballPath = path.join(repoRoot, tarball);

    run(npmCmd, ['init', '-y'], { cwd: tempDir });
    run(npmCmd, ['install', tarballPath], { cwd: tempDir });

    await assertPackageStarts(tempDir);

    process.stdout.write('Smoke package test passed.\n');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });

    if (tarballPath) {
      fs.rmSync(tarballPath, { force: true });
    }
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
