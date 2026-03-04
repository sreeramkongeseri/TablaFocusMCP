import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

if (process.env.NODE_ENV === 'production') {
  process.exit(0);
}

const huskyBinName = process.platform === 'win32' ? 'husky.cmd' : 'husky';
const huskyBinPath = path.resolve(process.cwd(), 'node_modules', '.bin', huskyBinName);

if (!fs.existsSync(huskyBinPath)) {
  process.exit(0);
}

const result = spawnSync(huskyBinPath, [], { stdio: 'inherit' });
process.exit(result.status ?? 0);
