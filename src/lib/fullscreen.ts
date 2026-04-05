import { fullscreen } from "@/lib/browser-utils";

export async function enterFullscreen(element?: Element | null) {
  return fullscreen.enter(element);
}

export async function exitFullscreen() {
  return fullscreen.exit();
}

export async function toggleFullscreen(element?: Element | null) {
  return fullscreen.toggle(element);
}

const fullscreenApi = { enterFullscreen, exitFullscreen, toggleFullscreen };

export default fullscreenApi;
