/** Hover/focus dwell before opening (~300–500ms band; avoids accidental flashes per common UX guidance). */
export const TOOLTIP_DWELL_MS = 400;

/** Desktop: landing intro (~delay + duration + small buffer). */
export const PAGE_TOOLTIP_GATE_DESKTOP_MS = 1400;

/**
 * Mobile: scroll-reveal waits INTRO_DELAY + per-card stagger + reveal transition buffer.
 * Card order ends with social (index 5): 2000 + 5×120 + ~700.
 */
export const PAGE_TOOLTIP_GATE_MOBILE_MS = 3300;
