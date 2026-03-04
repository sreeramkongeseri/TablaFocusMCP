import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const PACKAGE_JSON_PATH = path.resolve(process.cwd(), 'package.json');
const SERVER_JSON_PATH = path.resolve(process.cwd(), 'server.json');

async function readJson(filePath) {
  const text = await fs.readFile(filePath, 'utf8');
  return JSON.parse(text);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const packageJson = await readJson(PACKAGE_JSON_PATH);
  const serverJson = await readJson(SERVER_JSON_PATH);

  assert(
    typeof packageJson.name === 'string' && packageJson.name.trim().length > 0,
    'package.json must define name.',
  );
  assert(
    typeof packageJson.version === 'string' && packageJson.version.trim().length > 0,
    'package.json must define version.',
  );
  assert(
    typeof packageJson.mcpName === 'string' && packageJson.mcpName.trim().length > 0,
    'package.json must define mcpName.',
  );

  assert(
    typeof serverJson.name === 'string' && serverJson.name.trim().length > 0,
    'server.json must define name.',
  );
  assert(
    typeof serverJson.version === 'string' && serverJson.version.trim().length > 0,
    'server.json must define version.',
  );
  assert(
    Array.isArray(serverJson.packages) && serverJson.packages.length > 0,
    'server.json must contain at least one package in packages[].',
  );

  assert(
    packageJson.mcpName === serverJson.name,
    `mcpName mismatch: package.json (${packageJson.mcpName}) vs server.json (${serverJson.name})`,
  );
  assert(
    packageJson.version === serverJson.version,
    `version mismatch: package.json (${packageJson.version}) vs server.json (${serverJson.version})`,
  );

  const npmPackage = serverJson.packages.find((pkg) => pkg && pkg.registryType === 'npm');
  assert(npmPackage, 'server.json packages[] must include a registryType "npm" entry.');

  assert(
    npmPackage.identifier === packageJson.name,
    `npm package identifier mismatch: server.json (${npmPackage.identifier}) vs package.json (${packageJson.name})`,
  );

  if (typeof npmPackage.version === 'string' && npmPackage.version.trim().length > 0) {
    assert(
      npmPackage.version === packageJson.version,
      `npm package version mismatch: server.json (${npmPackage.version}) vs package.json (${packageJson.version})`,
    );
  }

  process.stdout.write('Registry metadata check passed.\n');
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
