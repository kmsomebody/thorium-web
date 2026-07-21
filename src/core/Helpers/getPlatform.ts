"use client";

// Extend Navigator interface to include userAgentData
declare global {
  interface Navigator {
    userAgentData?: {
      brands: Array<{brand: string; version: string}>;
      mobile: boolean;
      platform: string;
    };
  }
}

// See https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
export const getPlatform = () => {
  if (typeof window !== "undefined") {
    const nav = window.navigator;

    if (nav.userAgentData) {
      return nav.userAgentData.platform.toLowerCase();
    }

    // Deprecated but userAgentData still experimental…
    if (typeof nav.platform !== "undefined") {
      // android navigator.platform is often set as "linux", so we have to check userAgent
      if (typeof nav.userAgent !== "undefined" && /android/.test(nav.userAgent.toLowerCase())) {
        return "android";
      }
      return nav.platform.toLowerCase();
    }
  }

  return "unknown";
};

export const isMacish = () => {
  const MacOSPattern = /mac|ipod|iphone|ipad/i;
  const platform = getPlatform();
  return MacOSPattern.test(platform);
}

// “Desktop-class” iPadOS
export const isIpadOS = () => {
  return !!(navigator.maxTouchPoints 
        && navigator.maxTouchPoints > 2 
        && navigator.userAgent.includes("Intel"));
}

// Covers all iOS/iPadOS: iPhone/iPod/iPad by platform string + desktop-class iPadOS by UA sniff
export const isIOSish = () => {
  const AppleMobilePattern = /ipod|iphone|ipad/i;
  const platform = getPlatform();
  if (AppleMobilePattern.test(platform)) {
    return true;
  } else {
    return isIpadOS();
  }
}