// Copyright 2026 Google LLC
// SPDX-License-Identifier: Apache-2.0

// Guard rail for the site's no-telemetry rule: the layout, the Astro wrapper,
// and the package scripts must keep both runtime analytics and build telemetry out.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

const layouts = [
  read('../src/layouts/Base.astro'),
  read('../src/components/docs/Head.astro'),
];
const runner = read('../scripts/astro.mjs');
const config = read('../astro.config.mjs');
const pkg = JSON.parse(read('../package.json'));

test('the layouts load no third-party analytics or tracking resources', () => {
  for (const forbidden of [
    'gtag',
    'googletagmanager',
    'google-analytics',
    'cookienotificationbar',
    'gstatic.com',
    'dataLayer',
    'PUBLIC_GA_MEASUREMENT_ID',
  ]) {
    for (const layout of layouts) {
      assert.equal(
        layout.includes(forbidden),
        false,
        'layouts must not reference ' + forbidden,
      );
    }
  }
});

test('the Astro wrapper disables build telemetry', () => {
  assert.match(runner, /ASTRO_TELEMETRY_DISABLED: '1'/);
  assert.match(runner, /require\.resolve\('astro\/package\.json'\)/);
});

test('every Astro command routes through the telemetry-disabling wrapper', () => {
  for (const script of ['dev', 'build', 'preview', 'check']) {
    assert.match(pkg.scripts[script], /^npm run astro -- /, `${script} must use the wrapper`);
  }
  assert.equal(pkg.scripts['test:browser'], undefined);
});

test('the site configuration declares no analytics or telemetry integration', () => {
  // Descriptive mentions in comments are fine; wired-up integrations are not.
  assert.doesNotMatch(config, /@astrojs\/telemetry|posthog|sentry/i);
  for (const [name, spec] of Object.entries(pkg.dependencies ?? {})) {
    if (name === '@astrojs/telemetry') {
      // Astro imports this name, so it must resolve to the local no-op stub.
      assert.equal(spec, 'file:./vendor/astro-telemetry');
      continue;
    }
    assert.doesNotMatch(name, /analytics|telemetry|tracking|posthog|sentry/i);
  }
});

test('the telemetry dependency is replaced by the local no-op stub', () => {
  assert.equal(
    pkg.overrides?.['@astrojs/telemetry'],
    'file:./vendor/astro-telemetry',
    'package.json must override @astrojs/telemetry with the local stub',
  );
  const stub = read('../vendor/astro-telemetry/index.js');
  assert.match(stub, /export class AstroTelemetry/);
  assert.doesNotMatch(stub, /telemetry\.astro\.build|fetch\(/);
});
