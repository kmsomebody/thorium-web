import { ThLayoutUI } from "@/preferences";
import readerStyles from "../assets/styles/thorium-web.reader.app.module.css";
import classNames from "classnames";

interface ReaderStyleOptions {
  layoutUI: ThLayoutUI;
  isScroll: boolean;
  isImmersive?: boolean;
  isHovering?: boolean;
  isFXL?: boolean;
  breakpoint?: string;
  containerBreakpoint?: string;
}

const LAYOUT_CLASSES = {
  [ThLayoutUI.stacked]: "thorium_web_stackedUI",
  [ThLayoutUI.layered]: "thorium_web_layeredUI",
} as const;

const toBreakpointClass = (prefix: string, bp: string) =>
  `${ prefix }${ bp.charAt(0).toUpperCase() + bp.slice(1) }`;

export function getReaderClassNames(options: ReaderStyleOptions): string {
  const {
    layoutUI,
    isScroll,
    isImmersive = false,
    isHovering = false,
    isFXL = false,
    breakpoint,
    containerBreakpoint,
  } = options;

  return classNames(
    readerStyles.shell,
    isScroll ? "thorium_web_isScroll" : "thorium_web_isPaged",
    isImmersive && "thorium_web_isImmersive",
    isHovering && "thorium_web_isHovering",
    isFXL ? "thorium_web_isFXL" : "thorium_web_isReflow",
    LAYOUT_CLASSES[layoutUI],
    breakpoint ? toBreakpointClass("thorium_web_is", breakpoint) : undefined,
    containerBreakpoint ? toBreakpointClass("thorium_web_container_is", containerBreakpoint) : undefined
  );
}