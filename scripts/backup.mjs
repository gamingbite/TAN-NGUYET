import { constants } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const excludedDirectories = new Set([
  '.git', 'node_modules', 'dist', 'build', 'coverage', '.local-backups',
  '.cache', '.vite', '.parcel-cache', '.turbo', '.vercel', '.secrets',
  'test-results', 'playwright-report', 'local-data', 'saves', 'savegames',
]);
const label = (process.argv[2] ?? 'manual').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 60);
const backupRoot = join(projectRoot, '.local-backups');
await mkdir(backupRoot, { recursive: true });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const destination = await mkdtemp(join(backupRoot, `${timestamp}-${label}-`));
const copiedFiles = [];
const skippedLinks = [];

function isExcludedFile(name) {
  const lowerName = name.toLowerCase();
  const isEnvTemplate = /^\.env\.(example|sample|template)$/.test(lowerName)
    || /^\.env\..+\.example$/.test(lowerName);
  return ((lowerName === '.env' || lowerName.startsWith('.env.')) && !isEnvTemplate)
    || lowerName === '.envrc'
    || /\.(pem|key|p12|pfx|log|tmp|temp|swp|swo|tsbuildinfo)$/.test(lowerName)
    || ['thumbs.db', 'desktop.ini', '.ds_store', '.snapshot-manifest.json'].includes(lowerName);
}

async function copyDirectory(source, target) {
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);
    if (entry.isSymbolicLink()) {
      skippedLinks.push(relative(projectRoot, sourcePath));
      continue;
    }
    if (entry.isDirectory()) {
      if (excludedDirectories.has(entry.name.toLowerCase())) continue;
      await mkdir(targetPath, { recursive: true });
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile() && !isExcludedFile(entry.name)) {
      await copyFile(sourcePath, targetPath, constants.COPYFILE_EXCL);
      copiedFiles.push(relative(projectRoot, sourcePath));
    }
  }
}

try {
  await copyDirectory(projectRoot, destination);
  await writeFile(join(destination, '.snapshot-manifest.json'), JSON.stringify({
    formatVersion: 1,
    createdAt: new Date().toISOString(),
    source: projectRoot,
    files: copiedFiles,
    skippedLinks,
    excludes: [...excludedDirectories, '.env and private key files', 'temporary files'],
  }, null, 2), 'utf8');
  console.log(`Local backup created: ${destination}`);
  console.log(`Copied ${copiedFiles.length} files. Git, dependencies, builds, local saves and recognized secrets excluded.`);
  if (skippedLinks.length) console.log(`Skipped ${skippedLinks.length} symbolic links.`);
} catch (error) {
  console.error(`Backup incomplete at ${destination}. Existing project files were not changed.`);
  throw error;
}
