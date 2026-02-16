export const getAndroidPatchCss = () => {
  if (typeof window === "undefined") {
    return "";
  }
  
  const origin = window.location.origin;
  
  return `/* Readium CSS
   Android Fonts Patch module

   A stylesheet aligning Android generic serif and sans-serif fonts on other platforms

   Repo: https://github.com/readium/css */

/* Android resolves sans-serif to Roboto, and serif to Droid Serif 
   This created issues for FXL EPUBs relying on Times (New Roman),
   Helvetica or Arial while not embedding the font files in the package.

   See https://github.com/readium/css/issues/149

   Unfortunately it is no possible to target generic family using @font-face,
   we have to target specific font-family names e.g. Times, Arial, etc.

   This stylesheet/patch should be loaded only for this case i.e.
   a Fixed-Layout EPUB with text but no embedded font on an Android device.
   The logic for checking these conditions are up to implementers.
*/

/* Serif (Times + Times New Roman) */

@font-face {
  font-family: Times;
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: "Times New Roman";
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: Times;
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman-Italic.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: italic;
}

@font-face {
  font-family: "Times New Roman";
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman-Italic.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: italic;
}

@font-face {
  font-family: Times;
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman-Bold.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: "Times New Roman";
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman-Bold.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: Times;
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman-BoldItalic.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: italic;
}

@font-face {
  font-family: "Times New Roman";
  src: url("${ new URL("/fonts/AndroidPatch/serif/NimbusRoman-BoldItalic.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: italic;
}

/* Sans-serif (Helvetica + Arial) */

@font-face {
  font-family: Helvetica;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: Arial;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: Helvetica;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans-Italic.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: italic;
}

@font-face {
  font-family: Arial;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans-Italic.woff", origin).toString() }") format("woff");
  font-weight: normal;
  font-style: italic;
}

@font-face {
  font-family: Helvetica;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans-Bold.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: Arial;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans-Bold.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: normal;
}

@font-face {
  font-family: Helvetica;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans-BoldItalic.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: italic;
}

@font-face {
  font-family: Arial;
  src: url("${ new URL("/fonts/AndroidPatch/sans-serif/NimbusSans-BoldItalic.woff", origin).toString() }") format("woff");
  font-weight: bold;
  font-style: italic;
}`;
};
