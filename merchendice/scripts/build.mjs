import fs from 'node:fs/promises';

const assetFiles = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/examples/': ['examples/index.html', 'text/html; charset=utf-8'],
  '/examples': ['examples/index.html', 'text/html; charset=utf-8'],
  '/enquiry/': ['enquiry/index.html', 'text/html; charset=utf-8'],
  '/enquiry': ['enquiry/index.html', 'text/html; charset=utf-8'],
  '/examplepage.com/': ['examplepage.com/index.html', 'text/html; charset=utf-8'],
  '/examplepage.com': ['examplepage.com/index.html', 'text/html; charset=utf-8'],
  '/site.css': ['site.css', 'text/css; charset=utf-8'],
  '/site.js': ['site.js', 'text/javascript; charset=utf-8'],
  '/examples.js': ['examples.js', 'text/javascript; charset=utf-8'],
};
for (const page of ['products', 'creator-guide']) {
  for (const route of [`/${page}`, `/${page}/`]) {
    assetFiles[route] = [`${page}/index.html`, 'text/html; charset=utf-8'];
  }
}
const assets = {};
for (const file of await fs.readdir('photos')) {
  if (!file.endsWith('.jpg')) continue;
  const path = `photos/${file}`;
  assets['/' + path] = { base64: await fs.readFile(path, 'base64'), type: 'image/jpeg' };
}
for (const [route, [file, type]] of Object.entries(assetFiles)) {
  assets[route] = { body: await fs.readFile(file, 'utf8'), type };
}
const runtime = await fs.readFile('src/worker-runtime.mjs', 'utf8');
await fs.mkdir('dist', { recursive: true });
await fs.writeFile('dist/app.mjs', `const ASSETS = ${JSON.stringify(assets)};\n${runtime}`);
console.log('Built Merchendice site and enquiry endpoint.');
