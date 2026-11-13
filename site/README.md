# egm.dev

Website and documentation for the Elephant-Goldfish Model, served at https://egm.dev from
GitHub Pages.

| Light | Dark |
| --- | --- |
| ![Hero, light scheme](screenshots/hero-light.png) | ![Hero, dark scheme](screenshots/hero-dark.png) |

<details>
<summary>Full page and mobile</summary>

![Full page, light scheme](screenshots/full-light.png)

![Full page, dark scheme](screenshots/full-dark.png)

![Mobile, light scheme, 375px wide](screenshots/mobile.png)

![Mobile, dark scheme, 375px wide](screenshots/mobile-dark.png)

</details>

## Stack

- [Astro](https://astro.build) static output with a custom homepage and
  [Starlight](https://starlight.astro.build) documentation. Starlight provides
  local Pagefind search, a responsive sidebar, and a page contents panel.
- [gBreeze](https://www.npmjs.com/package/@material/web) (`@material/web`
  `labs/gb`) in its native-element form: the page emits the package's own
  class names (`btn`, `icon-btn`, `list-item`, `badge`, `divider`) and imports the
  package stylesheets. The gBreeze controls use native HTML without a Lit runtime.
- Google Sans Flex and Google Sans Code, self-hosted under
  `src/assets/fonts/` (OFL).

## Rules

- Theme only through gBreeze tokens (`src/styles/tokens.css`) and the
  components' documented custom properties. Do not restyle component boxes.
- Keep skill names and commands identical to the repository README.
- **Explainer video**: `src/components/Explainer.astro` renders a self-hosted
  poster inside a button and creates the `youtube-nocookie.com` iframe only
  after the visitor clicks play.
- **No analytics**: The site ships no analytics, tracking, consent banner,
  cookies, or client-side telemetry. It loads no third-party measurement script
  and makes zero requests to measurement hosts, on any hostname or in any build.
  Nothing here is gated behind an environment variable, so forks and local builds
  behave exactly like production. Keep it that way: a new analytics or
  session-replay dependency needs an explicit decision, not a dependency bump.

## Build telemetry

The Astro CLI reports anonymous build telemetry by default, including in CI,
because its opt-in notice is skipped there. The site does not emit it:

- scripts/astro.mjs sets ASTRO_TELEMETRY_DISABLED=1 for every CLI entry point.
  Use npm run astro -- <args> instead of calling astro directly; the dev,
  build, check, preview, and capture scripts already route through it.
  The flag is set in the script, not with an inline environment prefix, so it
  also works on Windows.
- A committed .env file cannot replace the wrapper: Astro injects .env values
  into import.meta.env only, while telemetry reads process.env.
- @astrojs/telemetry is replaced by a local no-op stub in
  vendor/astro-telemetry, wired in through the overrides field in
  package.json. The stub provides the API Astro imports and makes no requests.
  npm ci installs it, and tests/no-telemetry.test.mjs guards the override.
- ASTRO_TELEMETRY_DISABLED=1 remains set in CI as defense in depth.

## Skill icons

`src/components/SkillIcon.astro` imports the canonical
`../skills/egm-*/assets/icon.svg` files with `?url`. The website and plugin packages
use these same assets. Do not copy them into `public/` or redraw them in components.
Each decorative glyph is 28px inside a 40px circle using the existing surface
tokens, with an adjacent skill name or command providing its accessible label.
Documentation page titles use this component beside each skill name.

## Develop

```sh
npm install
npm run dev      # http://localhost:4321
npm run check    # astro check
npm run build    # writes dist/
npm run check:docs # validates built documentation and Markdown exports
npm run capture  # rebuilds, then regenerates public/og.png and screenshots/*.png
```

`npm run capture` needs a local Chrome (set `CHROME_PATH` when Chrome is not on `PATH`).
The social image comes from `scripts/og.html`. Edit that file, not the PNG.
Run `npm run capture` after any visible change so the committed images stay in sync.

## Search metadata

The homepage declares the site name as JSON-LD and links both the adaptive SVG
favicon and a 96px PNG fallback. The PNG uses the SVG's light-theme colors;
regenerate it when `public/favicon.svg` changes. The build generates
`sitemap-index.xml` for the homepage and every documentation page.

## Documentation

The docs collection loads `docs/site/**/*.md` from the repository. The loader
maps these files to `/guide`, `/install`, `/getting-started`, `/workflow`,
`/skills`, and `/skills/<command>`. Each skill page in `docs/site/skills/`
describes one skill for a reader and links to its canonical `SKILL.md`.

Each documentation page has a matching `.md` URL and an alternate link in its
HTML. `starlight-llms-txt` generates `/llms.txt`, `/llms-full.txt`, and
`/llms-small.txt`. These are static files with no AI service or API key.

Copy page appears below the desktop contents list and near the mobile title.
Both the homepage and docs use the shared header, footer, grid, and gBreeze controls.
The build fetches the GitHub star count once and omits it when GitHub is unavailable.
The header rounds counts above 1,000 stars to the nearest thousand.

## Deploy

`.github/workflows/deploy-site.yml` builds and publishes `dist/` on every push
to `main` that touches `site/`, `docs/site/`, or a skill icon. A daily
scheduled build refreshes the star count. The workflow also supports manual dispatch.
`public/CNAME` pins the custom domain.
