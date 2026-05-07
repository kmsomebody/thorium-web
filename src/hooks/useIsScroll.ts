"use client";

import { useAppSelector } from "@/lib/hooks";

export const useIsScroll = (): boolean => {
  const profile = useAppSelector(state => state.reader.profile);
  const scroll = useAppSelector(state => state.settings.scroll);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const scriptMode = useAppSelector(state => state.publication.scriptMode);

  if (profile === "webPub") return true;
  return (scroll || scriptMode === "cjk-vertical" || scriptMode === "mongolian-vertical") && !isFXL;
};
