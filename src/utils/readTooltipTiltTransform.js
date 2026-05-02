/** Matches `.magnetic-tilt-surface` / `[data-card]` perspective in app.css */
const TILT_PERSPECTIVE = '800px';

/**
 * Builds a CSS transform string so portaled tooltips match host tilt:
 * card/surface magnetic tilt (CSS vars) plus optional Z rotation from `data-tooltip-tilt-z` (degrees).
 */
export function readTooltipTiltTransform(anchorEl) {
  if (!anchorEl || typeof window === 'undefined') return '';

  const tiltRoot =
    anchorEl.closest('.magnetic-tilt-surface') ||
    anchorEl.closest('[data-card]:not([data-card="social"])');

  let rx = '0deg';
  let ry = '0deg';
  let s = '1';
  if (tiltRoot) {
    const cs = getComputedStyle(tiltRoot);
    rx = cs.getPropertyValue('--tilt-rx').trim() || '0deg';
    ry = cs.getPropertyValue('--tilt-ry').trim() || '0deg';
    s = cs.getPropertyValue('--tilt-s').trim() || '1';
  }

  const zRaw = anchorEl.dataset?.tooltipTiltZ;
  const rz = zRaw !== undefined && zRaw !== '' ? `${zRaw}deg` : '0deg';

  return `perspective(${TILT_PERSPECTIVE}) rotateX(${rx}) rotateY(${ry}) scale3d(${s}, ${s}, ${s}) rotateZ(${rz})`;
}
