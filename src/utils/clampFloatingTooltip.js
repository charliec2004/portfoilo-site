export const VIEWPORT_PAD = 10;
export const TOOLTIP_GAP = 8;

/**
 * Positions a fixed shell so `contentEl` sits above the anchor when possible,
 * clamped fully inside the viewport. Shell carries left/top; contentEl supplies measured size.
 */
export function clampFloatingTooltipPosition(anchorEl, shellEl, contentEl) {
  if (!anchorEl || !shellEl || !contentEl) return;

  contentEl.style.maxWidth = '';
  void contentEl.offsetWidth;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxTw = Math.max(0, vw - 2 * VIEWPORT_PAD);

  let tw = contentEl.offsetWidth;
  if (tw > maxTw) {
    contentEl.style.maxWidth = `${maxTw}px`;
    void contentEl.offsetWidth;
    tw = contentEl.offsetWidth;
  }

  const th = contentEl.offsetHeight;
  const br = anchorEl.getBoundingClientRect();

  let left = br.left + br.width / 2 - tw / 2;
  left = Math.min(Math.max(left, VIEWPORT_PAD), vw - tw - VIEWPORT_PAD);

  let top = br.top - th - TOOLTIP_GAP;
  if (top < VIEWPORT_PAD) {
    top = br.bottom + TOOLTIP_GAP;
  }
  top = Math.min(Math.max(top, VIEWPORT_PAD), vh - th - VIEWPORT_PAD);

  shellEl.style.left = `${Math.round(left)}px`;
  shellEl.style.top = `${Math.round(top)}px`;
}
