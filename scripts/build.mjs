import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgPath = path.join(root, 'package.json');

let nextCli;
try {
	const require = createRequire(pkgPath);
	nextCli = require.resolve('next/dist/bin/next');
} catch {
	console.error('[build] Next não encontrado. Rode `npm install` primeiro');
	process.exit(1);
}

const build = spawnSync(process.execPath, [nextCli, 'build'], {
	cwd: root,
	stdio: 'inherit',
	shell: false,
});
if (build.status !== 0) process.exit(build.status ?? 1);

const redirect404 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="utf-8"/>
	<meta http-equiv="refresh" content="0;url=/"/>
	<script>location.replace("/")</script>
</head>
<body><p style="text-align:center;margin-top:2rem">Redirecionando...</p></body>
</html>
`;
fs.writeFileSync(path.join(root, 'out', '404.html'), redirect404, 'utf8');
