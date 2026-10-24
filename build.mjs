// Builds dist/ from content/site.json + src/render.mjs + public/ + media/.
// Vercel runs this on every push (including saves from Pages CMS). No dependencies.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const dist = `${root}dist`;

export async function build() {
  // Cache-bust the template so the local preview picks up edits without a restart.
  const { render } = await import(`${pathToFileURL(`${root}src/render.mjs`).href}?t=${Date.now()}`);
  const content = JSON.parse(await readFile(`${root}content/site.json`, 'utf8'));

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await cp(`${root}public`, dist, { recursive: true });
  if (existsSync(`${root}media`)) await cp(`${root}media`, `${dist}/media`, { recursive: true });
  await writeFile(`${dist}/index.html`, render(content));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await build();
  console.log('Built dist/');
}
