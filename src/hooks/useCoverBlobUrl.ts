import { useState, useEffect, useRef } from "react";
import { proxyUrl } from "@/helpers/proxyUrl";

export const useCoverBlobUrl = (coverUrl: string | undefined): { coverBlobUrl: string | undefined; coverReady: boolean } => {
  const [coverBlobUrl, setCoverBlobUrl] = useState<string | undefined>(undefined);
  const [coverFailed, setCoverFailed] = useState(false);
  const revokeRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!coverUrl) return;
    const controller = new AbortController();
    const fetched = proxyUrl(coverUrl) ?? coverUrl;
    let objectUrl: string | undefined;
    fetch(fetched, { signal: controller.signal })
      .then(r => r.blob())
      .then(blob => {
        objectUrl = URL.createObjectURL(blob);
        revokeRef.current = () => URL.revokeObjectURL(objectUrl!);
        setCoverBlobUrl(objectUrl);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setCoverFailed(true);
      });
    return () => {
      controller.abort();
      revokeRef.current?.();
      revokeRef.current = undefined;
    };
  }, [coverUrl]);

  return {
    coverBlobUrl,
    coverReady: !coverUrl || !!coverBlobUrl || coverFailed,
  };
};
