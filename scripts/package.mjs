// Packages app/ into dist/. If local/icons/ has icon.png and large-icon.png,
// they replace the committed icons in this build only. local/ is gitignored,
// so CI and release builds always use the committed icons.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const icons = ['icon.png', 'large-icon.png'];
const localIcons = join('local', 'icons');
const useLocalIcons = icons.every((name) => existsSync(join(localIcons, name)));

let appDir = 'app';
let stageDir;
if (useLocalIcons) {
  stageDir = mkdtempSync(join(tmpdir(), 'udemyviewer-'));
  appDir = join(stageDir, 'app');
  cpSync('app', appDir, { recursive: true });
  for (const name of icons) cpSync(join(localIcons, name), join(appDir, name));
  console.log(`Using local icons from ${localIcons}/`);
}

mkdirSync('dist', { recursive: true });
try {
  execFileSync(join('node_modules', '.bin', 'ares-package'), ['--no-minify', appDir, '-o', 'dist'], { stdio: 'inherit' });
} finally {
  if (stageDir) rmSync(stageDir, { recursive: true, force: true });
}
