// Copyright 2026 Google LLC
// SPDX-License-Identifier: Apache-2.0

// Guard rail for the site's privacy rule. Outbound navigation is allowed for
// project documentation, but built pages must not load third-party resources or
// contain analytics endpoints.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const LOADABLE = [
  /<script\b[^>]*\bsrc="([^"]+)"/g,
  /<link\b[^>]*\bhref="([^"]+)"/g,
  /<img\b[^>]*\bsrc="([^"]+)"/g,
  /<iframe\b[^>]*\bsrc="([^"]+)"/g,
];
const TRACKING_URL =
  /googletagmanager\.com|google-analytics\.com|cookienotificationbar|telemetry\.astro\.build|gstatic\.com|PUBLIC_GA_MEASUREMENT_ID/i;

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => join(entry.parentPath ?? dir, entry.name));
}

test(
  'built pages load no third-party resources or analytics endpoints',
  { skip: !existsSync(dist) && 'run npm run build first' },
  () => {
    const files = htmlFiles(dist);
    assert.ok(files.length > 0, 'expected at least one built HTML file');

    for (const file of files) {
      const html = readFileSync(file, 'utf8');
      assert.doesNotMatch(html, TRACKING_URL, file + ' contains an analytics endpoint');

      for (const pattern of LOADABLE) {
        for (const [, value] of html.matchAll(pattern)) {
          if (/^(?:data:|mailto:|#|\/)/i.test(value)) continue;
          assert.match(
            value,
            /^https:\/\/egm\.dev(?:\/|$)/,
            file + ' must not load an external resource: ' + value,
          );
        }
      }
    }
  },
);
