/**
 * <orbit-absorb> — a framework-agnostic custom element.
 *
 * Icons revolve around a center, then collapse INTO the exact center and
 * re-emerge in a staggered wave. Pure SVG + CSS, no dependencies, SSR-safe to
 * import. Each icon's position and its "vector to center" is derived from the
 * config and handed to one shared keyframe via `--tx` / `--ty` custom props.
 */

export type OrbitIcon = string | { src: string; x?: number; y?: number };
export type OrbitDot = { cx: number; cy: number; r?: number; size?: number; fill: string };

const DEFAULTS = {
	radius: 140,
	iconSize: 80,
	badgeSize: 88,
	accent: "#007CE1",
	rings: 3,
	spinDuration: 60,
	absorbDuration: 7,
	stagger: 0.25,
	startAngle: -90,
	glow: true,
	emit: true,
};

const STYLE = /* css */ `
:host { display: block; }
.orbit-absorb { display: block; width: 100%; height: auto; }

.oa-rings {
	transform-origin: var(--oa-origin);
	will-change: transform, opacity;
	animation: oa-rings-breathe var(--oa-absorb) ease-in-out infinite;
}
.oa-emit {
	transform-box: fill-box;
	transform-origin: center;
	will-change: transform, opacity;
	backface-visibility: hidden;
	opacity: 0;
	animation: oa-emit var(--oa-absorb) ease-out infinite;
}
.oa-emit-1 { animation-delay: 0s; }
.oa-emit-2 { animation-delay: 0.45s; }
.oa-orbit {
	transform-origin: var(--oa-origin);
	animation: oa-spin var(--oa-spin) linear infinite;
}
.oa-upright {
	transform-box: fill-box;
	transform-origin: center;
	animation: oa-spin-rev var(--oa-spin) linear infinite;
}
.oa-absorb {
	will-change: transform, opacity;
	backface-visibility: hidden;
	animation: oa-absorb var(--oa-absorb) ease-in-out infinite;
}
.oa-glow {
	transform-box: fill-box;
	transform-origin: center;
	animation: oa-glow 5s ease-in-out infinite;
}
.oa-dot {
	transform-box: fill-box;
	transform-origin: center;
	will-change: transform, opacity;
	animation: oa-dot 3s ease-in-out infinite;
}
.oa-center {
	display: flex;
	width: 100%;
	height: 100%;
	align-items: center;
	justify-content: center;
}

@keyframes oa-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes oa-spin-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
@keyframes oa-absorb {
	0%, 45% { transform: translate(0, 0) scale(1); opacity: 1; }
	52% { transform: translate(var(--tx), var(--ty)) scale(0.12); opacity: 1; }
	57%, 78% { transform: translate(var(--tx), var(--ty)) scale(0.12); opacity: 0; }
	82% { transform: translate(var(--tx), var(--ty)) scale(0.12); opacity: 1; }
	90%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
}
@keyframes oa-rings-breathe {
	0%, 42% { transform: scale(1); opacity: 1; }
	60% { transform: scale(1.12); opacity: 0.65; }
	100% { transform: scale(1); opacity: 1; }
}
@keyframes oa-emit {
	0%, 48% { transform: scale(0.5); opacity: 0; }
	56% { transform: scale(0.55); opacity: 0.7; }
	92%, 100% { transform: scale(1.1); opacity: 0; }
}
@keyframes oa-glow {
	0%, 100% { transform: scale(1); opacity: 1; }
	50% { transform: scale(1.08); opacity: 0.78; }
}
@keyframes oa-dot {
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.4; transform: scale(0.55); }
}

@media (prefers-reduced-motion: reduce) {
	.oa-orbit, .oa-upright, .oa-rings, .oa-glow, .oa-emit, .oa-dot, .oa-absorb { animation: none; }
	.oa-absorb { transform: none; opacity: 1; }
	.oa-emit { opacity: 0; }
}
`;

function esc(s: string): string {
	return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export class OrbitAbsorbElement extends HTMLElement {
	static get observedAttributes(): string[] {
		return [
			"icons", "dots", "ring-radii", "radius", "icon-size", "badge-size",
			"accent", "rings", "spin-duration", "absorb-duration", "stagger",
			"start-angle", "glow", "emit", "width", "height", "center-x", "center-y",
		];
	}

	private _icons?: OrbitIcon[];
	private _dots?: OrbitDot[];
	private _ringRadii?: number[];

	/** Set icons as a JS array (frameworks) instead of a JSON attribute. */
	set icons(v: OrbitIcon[]) { this._icons = v; this.render(); }
	get icons(): OrbitIcon[] { return this._icons ?? this.json("icons", []); }

	set dots(v: OrbitDot[]) { this._dots = v; this.render(); }
	get dots(): OrbitDot[] { return this._dots ?? this.json("dots", []); }

	set ringRadii(v: number[]) { this._ringRadii = v; this.render(); }
	get ringRadii(): number[] | undefined { return this._ringRadii ?? this.json("ring-radii", undefined); }

	connectedCallback(): void {
		if (!this.shadowRoot) this.attachShadow({ mode: "open" });
		this.render();
	}

	attributeChangedCallback(): void {
		if (this.shadowRoot) this.render();
	}

	private num(attr: string, def: number): number {
		const v = this.getAttribute(attr);
		return v === null || v === "" ? def : Number(v);
	}

	private bool(attr: string, def: boolean): boolean {
		const v = this.getAttribute(attr);
		return v === null ? def : v !== "false";
	}

	private json<T>(attr: string, def: T): T {
		const v = this.getAttribute(attr);
		if (!v) return def;
		try { return JSON.parse(v) as T; }
		catch { return def; }
	}

	private render(): void {
		if (!this.shadowRoot) return;

		const radius = this.num("radius", DEFAULTS.radius);
		const iconSize = this.num("icon-size", DEFAULTS.iconSize);
		const badgeSize = this.num("badge-size", DEFAULTS.badgeSize);
		const accent = this.getAttribute("accent") ?? DEFAULTS.accent;
		const rings = this.num("rings", DEFAULTS.rings);
		const spin = this.num("spin-duration", DEFAULTS.spinDuration);
		const absorb = this.num("absorb-duration", DEFAULTS.absorbDuration);
		const stagger = this.num("stagger", DEFAULTS.stagger);
		const startAngle = this.num("start-angle", DEFAULTS.startAngle);
		const glow = this.bool("glow", DEFAULTS.glow);
		const emit = this.bool("emit", DEFAULTS.emit);
		const icons = this.icons;
		const dots = this.dots;

		const pad = iconSize / 2 + 12;
		const w = this.hasAttribute("width") ? this.num("width", 0) : 2 * (radius + pad);
		const h = this.hasAttribute("height") ? this.num("height", 0) : 2 * (radius + pad);
		const cx = this.hasAttribute("center-x") ? this.num("center-x", 0) : w / 2;
		const cy = this.hasAttribute("center-y") ? this.num("center-y", 0) : h / 2;

		const items = icons.map((icon, i) => {
			const n = icons.length;
			let hx: number;
			let hy: number;
			if (typeof icon !== "string" && icon.x !== undefined && icon.y !== undefined) {
				hx = icon.x + iconSize / 2;
				hy = icon.y + iconSize / 2;
			}
			else {
				const a = ((startAngle + (360 / n) * i) * Math.PI) / 180;
				hx = cx + radius * Math.cos(a);
				hy = cy + radius * Math.sin(a);
			}
			return {
				src: typeof icon === "string" ? icon : icon.src,
				x: hx - iconSize / 2,
				y: hy - iconSize / 2,
				tx: (cx - hx).toFixed(2),
				ty: (cy - hy).toFixed(2),
				ox: hx.toFixed(2),
				oy: hy.toFixed(2),
				delay: (i * stagger).toFixed(3),
			};
		});

		// viewBox grows to always contain the orbiting icons (no top/bottom clip).
		let maxR = radius;
		for (const it of items) {
			const ihx = it.x + iconSize / 2;
			const ihy = it.y + iconSize / 2;
			maxR = Math.max(maxR, Math.hypot(ihx - cx, ihy - cy));
		}
		const reach = maxR + iconSize / 2;
		const minX = Math.min(0, cx - reach);
		const minY = Math.min(0, cy - reach);
		const vbW = Math.max(w, cx + reach) - minX;
		const vbH = Math.max(h, cy + reach) - minY;
		const viewBox = `${minX.toFixed(1)} ${minY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)}`;

		const ringRadii = this.ringRadii?.length
			? this.ringRadii
			: Array.from({ length: Math.max(1, rings) }, (_, i) => {
				const inner = badgeSize / 2 + 16;
				const n = Math.max(1, rings);
				return n === 1 ? radius : inner + ((radius - inner) * i) / (n - 1);
			});

		const ringStops = `
			<stop offset="0%" stop-color="#C8D0D9" stop-opacity="0"/>
			<stop offset="55%" stop-color="#C8D0D9" stop-opacity="0.45"/>
			<stop offset="100%" stop-color="#9AA7B8" stop-opacity="0.85"/>`;
		const glowStops = `
			<stop offset="0%" stop-color="${esc(accent)}" stop-opacity="0.22"/>
			<stop offset="45%" stop-color="${esc(accent)}" stop-opacity="0.10"/>
			<stop offset="100%" stop-color="${esc(accent)}" stop-opacity="0"/>`;

		const ringsSvg = ringRadii
			.map(r => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#oa-ring)" stroke-width="1.5"/>`)
			.join("");

		const emitSvg = emit
			? `<circle class="oa-emit oa-emit-1" cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#C8D0D9" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
			   <circle class="oa-emit oa-emit-2" cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#C8D0D9" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`
			: "";

		const glowSvg = glow
			? `<circle class="oa-glow" cx="${cx}" cy="${cy}" r="${badgeSize * 1.1}" fill="url(#oa-glow)"/>`
			: "";

		const iconsSvg = items
			.map(it =>
				`<g class="oa-absorb" style="--tx:${it.tx}px;--ty:${it.ty}px;transform-origin:${it.ox}px ${it.oy}px;animation-delay:${it.delay}s">
					<g class="oa-upright">
						<image href="${esc(it.src)}" x="${it.x}" y="${it.y}" width="${iconSize}" height="${iconSize}"/>
					</g>
				</g>`,
			)
			.join("");

		const dotsSvg = dots
			.map((d, i) => {
				const delay = `animation-delay:${(i * 0.6).toFixed(2)}s`;
				return d.size
					? `<rect class="oa-dot" x="${d.cx - d.size / 2}" y="${d.cy - d.size / 2}" width="${d.size}" height="${d.size}" rx="1" fill="${esc(d.fill)}" style="${delay}"/>`
					: `<circle class="oa-dot" cx="${d.cx}" cy="${d.cy}" r="${d.r ?? 4}" fill="${esc(d.fill)}" style="${delay}"/>`;
			})
			.join("");

		this.shadowRoot.innerHTML = `<style>${STYLE}</style>
			<svg class="orbit-absorb" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg"
				style="--oa-origin:${cx}px ${cy}px;--oa-spin:${spin}s;--oa-absorb:${absorb}s">
				<defs>
					<linearGradient id="oa-ring" x1="0" y1="0" x2="1" y2="1">${ringStops}</linearGradient>
					<radialGradient id="oa-glow" cx="0.5" cy="0.5" r="0.5">${glowStops}</radialGradient>
				</defs>
				<g class="oa-rings">${ringsSvg}</g>
				${emitSvg}
				${glowSvg}
				<g class="oa-orbit">${iconsSvg}</g>
				<g class="oa-badge">
					<circle cx="${cx}" cy="${cy}" r="${badgeSize / 2}" fill="${esc(accent)}"/>
					<foreignObject x="${cx - badgeSize / 2}" y="${cy - badgeSize / 2}" width="${badgeSize}" height="${badgeSize}">
						<div class="oa-center"><slot></slot></div>
					</foreignObject>
				</g>
				${dotsSvg}
			</svg>`;
	}
}

export function defineOrbitAbsorb(tag = "orbit-absorb"): void {
	if (typeof customElements !== "undefined" && !customElements.get(tag)) {
		customElements.define(tag, OrbitAbsorbElement);
	}
}
