// Copyright 2026 Google LLC
// SPDX-License-Identifier: Apache-2.0

// Local replacement for @astrojs/telemetry, wired in through the `overrides`
// field in site/package.json. Astro's CLI imports `AstroTelemetry` to report
// anonymous build telemetry; this fork ships no telemetry, so every method is a
// no-op and no network request is made.
//
// The surface below is exactly what Astro calls: the constructor, `record`,
// `setEnabled`, `notify`, and `clear`. `isDisabled` is always true so any
// caller that checks it takes the disabled path.
export class AstroTelemetry {
  constructor(options = {}) {
    this.options = options;
  }

  get isDisabled() {
    return true;
  }

  get enabled() {
    return false;
  }

  async notify() {
    return false;
  }

  async record() {}

  setEnabled() {}

  clear() {}

  get config() {
    return {
      get() {},
      set() {},
      delete() {},
      clear() {},
    };
  }
}
