# orbit-absorb

A dependency-free `<orbit-absorb>` web component. Icons revolve around a center,
collapse **into** the exact center, and re-emerge in a staggered wave — pure
SVG + CSS, zero dependencies, works in any framework (or none).

- 🪶 **No dependencies** — one custom element, ~5 KB
- 🎯 **Auto-layout** — pass an icon list, it distributes them on the ring and
  computes each icon's path to the center
- 🧩 **Slotted center** — put any logo/markup in the middle
- ♿ **Respects `prefers-reduced-motion`**
- 🖼️ **No clipping** — the viewBox auto-expands so top/bottom icons stay whole

## Install

```bash
npm install orbit-absorb
```

```js
import "orbit-absorb"; // registers <orbit-absorb>
```

Or straight from a CDN, no build step:

```html
<script type="module" src="https://unpkg.com/orbit-absorb"></script>
```

## Usage

```html
<orbit-absorb accent="#007CE1" id="oa">
  <img src="/logo.svg" alt="" width="36" />
</orbit-absorb>

<script type="module">
  import "orbit-absorb";
  // arrays go through the property (attributes are for primitives)
  document.getElementById("oa").icons = [
    "/meta.svg", "/google.svg", "/tiktok.svg", "/x.svg", "/snapchat.svg",
  ];
</script>
```

Pin icons to exact positions instead of auto-distributing:

```js
el.icons = [
  { src: "/meta.svg", x: 118, y: 23 },
  { src: "/x.svg", x: 226, y: 236 },
];
```

### Frameworks

It's a standard custom element, so it works in React, Vue, Svelte, Angular, etc.
Pass arrays via the DOM property (a `ref`/`bind`), primitives via attributes.

## Attributes / properties

| Attribute | Property | Type | Default | Description |
|---|---|---|---|---|
| `icons` | `.icons` | `string[]` \| `{src,x?,y?}[]` | `[]` | Icons (URL list, or pinned positions) |
| `dots` | `.dots` | `{cx,cy,r?,size?,fill}[]` | `[]` | Decorative dots (circle via `r`, square via `size`) |
| `ring-radii` | `.ringRadii` | `number[]` | auto | Explicit ring radii (overrides `rings`) |
| `radius` | — | `number` | `140` | Orbit radius |
| `icon-size` | — | `number` | `80` | Icon box size |
| `badge-size` | — | `number` | `88` | Center badge diameter |
| `accent` | — | `string` | `#007CE1` | Badge fill + glow color |
| `rings` | — | `number` | `3` | Number of guide rings |
| `spin-duration` | — | `number` (s) | `60` | One full revolution |
| `absorb-duration` | — | `number` (s) | `7` | One absorb / re-emerge cycle |
| `stagger` | — | `number` (s) | `0.25` | Delay between icons (the wave) |
| `start-angle` | — | `number` (deg) | `-90` | First auto-distributed icon angle |
| `glow` | — | `boolean` | `true` | 360° glow behind the badge |
| `emit` | — | `boolean` | `true` | Radar rings emitted each cycle |
| `width` `height` `center-x` `center-y` | — | `number` | auto | Override the design coordinate box |

The default slot is the center badge content.

## How it works

Three nested transforms keep the motions independent:

1. **orbit** — revolves every icon around the center (pivots on the center, so it
   never shifts where the absorb lands)
2. **absorb** — translates each icon to the exact center via per-icon `--tx`/`--ty`
   custom properties feeding one shared keyframe
3. **upright** — counter-rotates each icon about its own center to stay level

## License

MIT © gokh4nozturk
