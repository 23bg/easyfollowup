export async function enterFullscreen(element?: Element | null) {
  if (typeof document === 'undefined') return;
  const el = element ?? document.documentElement;
  try {
    if ((el as any).requestFullscreen) await (el as any).requestFullscreen();
    else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
  } catch (e) {
    console.error('enterFullscreen failed', e);
  }
}

export async function exitFullscreen() {
  if (typeof document === 'undefined') return;
  try {
    if ((document as any).exitFullscreen) await (document as any).exitFullscreen();
    else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
  } catch (e) {
    console.error('exitFullscreen failed', e);
  }
}

export async function toggleFullscreen(element?: Element | null) {
  if (typeof document === 'undefined') return;
  const active = (document as any).fullscreenElement || (document as any).webkitFullscreenElement || null;
  if (active) await exitFullscreen();
  else await enterFullscreen(element);
}

export default { enterFullscreen, exitFullscreen, toggleFullscreen };
