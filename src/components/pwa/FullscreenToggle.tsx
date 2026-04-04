"use client";

import { useEffect, useState } from "react";
import { toggleFullscreen } from "@/lib/fullscreen";

export default function FullscreenToggle() {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const handler = () => {
      const active = (document as any).fullscreenElement || (document as any).webkitFullscreenElement || null;
      setIsFs(!!active);
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler as any);
    handler();
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler as any);
    };
  }, []);

  return (
    <button
      onClick={() => toggleFullscreen()}
      className="px-3 py-1 rounded border text-sm"
      aria-pressed={isFs}
    >
      {isFs ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    </button>
  );
}
