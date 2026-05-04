import { lazy, Suspense, useState, useEffect } from "react";

import { Publication, Locator } from "@readium/shared";
import { ThThemeKeys, ThemeKeyType, useTheming } from "@/preferences";

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
import { ThPlugin } from "../Plugins";

const StatefulEpubReader = lazy(() => import("@/components/Epub").then(mod => ({ default: mod.StatefulReader })));

const StatefulWebPubReader = lazy(() => import("@/components/WebPub").then(mod => ({ default: mod.ExperimentalWebPubStatefulReader })));

export interface PositionStorage {
  get: () => Locator | undefined;
  set: (locator: Locator) => void | Promise<void>;
}

export interface StatefulReaderProps {
  publication: Publication;
  localDataKey: string | null;
  plugins?: ThPlugin[];
  positionStorage?: PositionStorage;
}

export type ThPluginFactory = () => ThPlugin[] | Promise<ThPlugin[]>;

export interface ReaderPlugins {
  epub?: ThPluginFactory;
  webPub?: ThPluginFactory;
  audio?: ThPluginFactory;
}

export interface ReaderComponentProps {
  profile: "epub" | "webPub" | "audio" | undefined | null;
  publication: Publication;
  localDataKey: string | null;
  positionStorage?: PositionStorage;
  plugins?: ReaderPlugins;
}

export const StatefulReaderWrapper = ({ profile, plugins, ...props }: ReaderComponentProps) => {
  const [resolvedPlugins, setResolvedPlugins] = useState<ThPlugin[] | undefined>(undefined);

  const pendingFactory = profile === "epub" ? plugins?.epub
    : profile === "webPub" ? plugins?.webPub
    : profile === "audio" ? plugins?.audio
    : undefined;

  useEffect(() => {
    if (!pendingFactory) return;
    const result = pendingFactory();
    if (result instanceof Promise) {
      result.then(setResolvedPlugins);
    } else {
      setResolvedPlugins(result);
    }
  }, [pendingFactory]);

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

  if (pendingFactory && resolvedPlugins === undefined) return null;

  switch (profile) {
    case "epub":
      return <Suspense><StatefulEpubReader { ...props } plugins={ resolvedPlugins } /></Suspense>;
    case "audio":
      // TODO: Implement audio reader when available
      return <div className="container"><h1>Audio Reader Coming Soon</h1></div>;
    case "webPub":
    default:
      return <Suspense><StatefulWebPubReader { ...props } plugins={ resolvedPlugins } /></Suspense>;
  }
};
