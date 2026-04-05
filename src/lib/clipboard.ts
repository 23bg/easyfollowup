import { clipboard } from "@/lib/browser-utils";

export async function copyToClipboard(text: string): Promise<boolean> {
  return clipboard.writeText(text);
}

export async function readFromClipboard(): Promise<string | null> {
  return clipboard.readText();
}

const clipboardApi = { copyToClipboard, readFromClipboard };

export default clipboardApi;
