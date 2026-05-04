import dynamic from "next/dynamic";

import { Publication, Locator } from "@readium/shared";
import { ThThemeKeys, ThemeKeyType, useTheming } from "@/preferences";

export interface PositionStorage {
  get: () => Locator | undefined;
  set: (locator: Locator) => void | Promise<void>;
}

import { usePreferences } from "@/preferences/hooks/usePreferences";

import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { 
  setBreakpoint, 
  setColorScheme, 
  setContrast, 
  setForcedColors, 
  setMonochrome, 
  setReducedMotion, 
  setReducedTransparency 
} from "@/lib/themeReducer";

import { propsToCSSVars } from "@/core/Helpers/propsToCSSVars";
import { prefixString } from "@/core/Helpers/prefixString";

const StatefulEpubReader = dynamic(() => import("@/components/Epub").then(mod => ({ default: mod.StatefulReader })), {
  ssr: false
});

const StatefulWebPubReader = dynamic(() => import("@/components/WebPub").then(mod => ({ default: mod.ExperimentalWebPubStatefulReader })), {
  ssr: false
});

interface ReaderComponentProps {
  profile: "epub" | "webPub" | "audio" | undefined | null;
  publication: Publication;
  localDataKey: string | null;
  positionStorage?: PositionStorage;
}

export const StatefulReaderWrapper = ({ profile, ...props }: ReaderComponentProps) => {
  const { preferences } = usePreferences();
  const themeObject = useAppSelector(state => state.theming.theme);
  const isFXL = useAppSelector(state => state.publication.isFXL);
  const theme = profile === "epub" ? (isFXL ? themeObject.fxl : themeObject.reflow) : ThThemeKeys.light;

  const dispatch = useAppDispatch();

  // Init theming (breakpoints, theme, media queries…)
  useTheming<ThemeKeyType>({ 
    theme: theme,
    themeKeys: preferences.theming.themes.keys,
    systemKeys: preferences.theming.themes.systemThemes,
    breakpointsMap: preferences.theming.breakpoints,
    initProps: {
      ...propsToCSSVars(preferences.theming.arrow, { prefix: prefixString("arrow") }), 
      ...propsToCSSVars(preferences.theming.icon, { prefix: prefixString("icon") }),
      ...propsToCSSVars(preferences.theming.layout, { 
        prefix: prefixString("layout"),
        exclude: ["ui"]
      })
    },
    onBreakpointChange: (breakpoint) => dispatch(setBreakpoint(breakpoint)),
    onColorSchemeChange: (colorScheme) => dispatch(setColorScheme(colorScheme)),
    onContrastChange: (contrast) => dispatch(setContrast(contrast)),
    onForcedColorsChange: (forcedColors) => dispatch(setForcedColors(forcedColors)),
    onMonochromeChange: (isMonochrome) => dispatch(setMonochrome(isMonochrome)),
    onReducedMotionChange: (reducedMotion) => dispatch(setReducedMotion(reducedMotion)),
    onReducedTransparencyChange: (reducedTransparency) => dispatch(setReducedTransparency(reducedTransparency))
  });

  switch (profile) {
    case "epub":
      return <StatefulEpubReader { ...props } />;
    case "audio":
      // TODO: Implement audio reader when available
      return <div className="container"><h1>Audio Reader Coming Soon</h1></div>;
    case "webPub":
    default:
      return <StatefulWebPubReader { ...props } />;
  }
};
