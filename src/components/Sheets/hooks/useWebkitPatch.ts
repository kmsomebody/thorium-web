import { useEffect } from "react";

import { useNavigator } from "@/core/Navigator";
import { usePrevious } from "@/core/Hooks/usePrevious";
import { FXLFrameManager, FrameManager, WebPubFrameManager } from "@readium/navigator";

import { useAppSelector } from "@/lib";

/** For some unknown reason, React Aria Components’ Popover and Modal Components
 *  are breaking scroll on webkit based browsers in version 1.11.0. 
 *  It is all the more mind-boggling that the hook we are using for 
 *  the Bottom Sheet don’t seem to be affected by this issue – but it could be forcing
 *  a reflow thanks to its animation. 
 * 
 *  NOTE: This is treating the symptoms and is unsustainable in the long run. 
 *  We have to find the root cause of this issue and fix it, 
 *  especially as TS-Toolkit already resolves this bug
 *  when the resources are loaded into the iframe directly as scroll. 
*/
export const useWebkitPatch = (isOpen: boolean) => {
  const profile = useAppSelector(state => state.reader.profile);
  const isWebPub = profile === "webPub";
  const scroll = useAppSelector(state => state.settings.scroll);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const isScroll = isWebPub || (scroll && !isFXL);

  const prevIsOpen = usePrevious(isOpen);

  let getCframes: (() => (FXLFrameManager | FrameManager | WebPubFrameManager | undefined)[] | undefined) | undefined;
  try {
    const visual = useNavigator().visual;
    getCframes = visual.getCframes;
  } catch (e) {
    // Visual navigator not available (audio profile)
    getCframes = undefined;
  }

  useEffect(() => {
    if (isScroll && prevIsOpen && !isOpen && getCframes) {
      // We have to force a reflow on the iframe container to fix the issue.
      // Using the infamous Recalc technique (adding a style element with *{}) 
      // in the iframe contentDocument does not work.
      const container = document.getElementById("thorium-web-container");
      if (!container) return;

      const currentHeight = container.offsetHeight;
      container.style.height = `${ currentHeight - 1 }px`;

      // Otherwise Safari will ignore the reflow.
      setTimeout(() => {
        container.style.height = "";

        // This is where it becomes unsustainable, because we have to 
        // force a scroll on the iframe scrolling element so that Safari
        // even renders the content that is below the viewport…
        // We only have access to the iframe scrolling element
        // because we are on the same origin…
        if (!getCframes) return;
        const frames = getCframes();
        if (!frames || !Array.isArray(frames) || frames.length === 0) return;
        const frame = frames[0];
        
        // Safely check if frame window is accessible
        let frameWindow;
        try {
          frameWindow = frame?.window;
          if (!frameWindow?.document?.scrollingElement) return;
        } catch (e) {
          // Frame is not accessible (cross-origin or invalid state)
          return;
        }

        const currentScrollTop = frameWindow.document.scrollingElement.scrollTop;

        if (currentScrollTop > 1) {
          frameWindow.document.scrollingElement.scrollTop = currentScrollTop - 1;
        } else {
          frameWindow.document.scrollingElement.scrollTop = currentScrollTop + 1;
        }

        frameWindow.document.scrollingElement.scrollTop = currentScrollTop;
      }, 0);
    }
  }, [isScroll, isOpen, prevIsOpen, getCframes]);
};
