// Copyright 2026 Google LLC
// SPDX-License-Identifier: Apache-2.0

// Astro build telemetry is opt-out: without this flag every `astro build` posts
// anonymous data to https://telemetry.astro.build, including CI runs. A committed
// .env file cannot stop it because Astro only injects .env values into
// `import.meta.env`, while telemetry reads `process.env`.
//
// `npm run astro -- <args>` runs the CLI with telemetry disabled, so every entry
// point (dev, build, check, preview, telemetry) inherits the flag. It is set here
// rather than with an inline `VAR=1` prefix so the scripts also work on Windows,
// which the validation matrix covers.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import process from 'node:process';

const require = createRequire(import.meta.url);

let cli;
try {
  // The package's `exports` map does not expose the CLI, so resolve the manifest
  // and read the entry point from its `bin` field instead of hardcoding a path.
  const manifest = require('astro/package.json');
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.astro;
  cli = join(dirname(require.resolve('astro/package.json')), bin);
} catch {
  console.error('astro is not installed. Run `npm ci` first.');
  process.exit(1);
}

const result = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
