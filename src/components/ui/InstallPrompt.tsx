"use client";

import { useEffect, useState } from "react";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(ua);
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsMobile(mobile);
    setIsIos(ios);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(Boolean(standalone));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const appInstalledHandler = () => {
      setIsInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    window.addEventListener("appinstalled", appInstalledHandler);

    const media = window.matchMedia("(display-mode: standalone)");
    const mediaHandler = (event: MediaQueryListEvent) => {
      if (event.matches) setIsInstalled(true);
    };
    media.addEventListener("change", mediaHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
      window.removeEventListener("appinstalled", appInstalledHandler);
      media.removeEventListener("change", mediaHandler);
    };
  }, []);

  if (isInstalled || !isMobile) return null;

  const onInstall = async () => {
    if (!deferred) {
      if (isIos) setShowIosHelp((prev) => !prev);
      return;
    }

    await deferred.prompt();
    const choice = await deferred.userChoice;

    // Keep showing until the app is truly installed.
    if (choice.outcome !== "accepted") {
      return choice;
    }

    setDeferred(null);
    return choice;
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={onInstall}
        variant="outline"
        size="sm"
        title="Install app"
      >
        {isIos ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        {deferred ? "Install App" : "How to Install"}
      </Button>

      {!deferred && !isIos ? (
        <p className="max-w-56 text-right text-xs text-muted-foreground">
          Use your browser menu and tap "Add to Home screen" to install the app.
        </p>
      ) : null}

      {isIos && showIosHelp ? (
        <p className="max-w-64 text-right text-xs text-muted-foreground">
          In Safari, tap <span className="font-medium">Share</span> then choose <span className="font-medium">Add to Home Screen</span>.
        </p>
      ) : null}
    </div>
  );
}
