/**
 * True for any browser running on the WebKit engine without Chrome's Blink layer
 * (Safari on macOS/iOS, and all iOS browsers which are forced onto WebKit).
 * Used to gate around WebKit-specific platform quirks.
 */
export const isWebKit = typeof navigator !== "undefined"
  && /webkit/i.test(navigator.userAgent)
  && !/chrome/i.test(navigator.userAgent);
