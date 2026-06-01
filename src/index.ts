export { OrbitAbsorbElement, defineOrbitAbsorb } from "./orbit-absorb";
export type { OrbitIcon, OrbitDot } from "./orbit-absorb";

import { defineOrbitAbsorb } from "./orbit-absorb";

// Auto-register <orbit-absorb> on import (browser only).
if (typeof window !== "undefined") {
	defineOrbitAbsorb();
}
