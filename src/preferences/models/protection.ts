import { IContentProtectionConfig } from "@readium/navigator";
import { I18nValue } from "./i18n";

export interface CopyProtectionConfig {
  /** Maximum percentage of content that can be selected (0-1) */
  maxSelectionPercent: number;
  /** Minimum number of characters that can be selected before protection kicks in */
  minThreshold: number;
  /** Absolute maximum number of characters that can be copied in total */
  absoluteMaxChars: number;
  /** Number of recent copy attempts to keep in history for pattern analysis */
  historySize: number;
}

export interface PrintProtectionConfig {
  /** Disable printing completely */
  disable?: boolean;
  /** Optional watermark text to show when printing is disabled */
  watermark?: I18nValue<string>;
}

export interface ContentProtectionConfig {
  /**
   * Higher-level API will make use of the following from Content Protection API:
   * - checkAutomation
   * - checkIFrameEmbedding
   * - monitorSelection
   * - monitorDevTools
   * - monitorScrollingExperimental
   */

  /**
   * Configure copy protection
   * - boolean: true to enable with default settings, false to disable
   * - object: Fine-grained control over copy protection
   */
  protectCopy?: boolean | CopyProtectionConfig;

  /** Disable right-click context menu */
  disableContextMenu?: boolean;

  /** Disable drag and drop functionality */
  disableDragAndDrop?: boolean;

  /** Print protection configuration */
  protectPrinting?: PrintProtectionConfig;

  /** Disable Select All functionality (Ctrl+A/Cmd+A) */
  disableSelectAll?: boolean;

  /** Disable Save functionality (Ctrl+S/Cmd+S) */
  disableSave?: boolean;

  /** Monitor developer tools for suspicious activity. We need it for the shortcut protection */
  monitorDevTools?: boolean;
}

/**
 * Resolves content protection configuration with localized strings
 * @param contentProtection The content protection config to resolve
 * @param t Translation function that supports defaultValue option
 * @returns Resolved content protection config compatible with navigator
 */
export const resolveContentProtectionConfig = (
  contentProtection: ContentProtectionConfig | undefined,
  t: (key: string, options?: { defaultValue?: string }) => string
): IContentProtectionConfig | undefined => {
  if (!contentProtection) return undefined;
  
  // Resolve watermark localization following the StatefulFontFamily pattern
  let resolvedWatermark: string | undefined;
  if (contentProtection.protectPrinting?.watermark) {
    if (typeof contentProtection.protectPrinting.watermark === "object" && "key" in contentProtection.protectPrinting.watermark) {
      // Handle I18nValue object with key and fallback using t() defaultValue option
      resolvedWatermark = t(contentProtection.protectPrinting.watermark.key, {
        defaultValue: contentProtection.protectPrinting.watermark.fallback
      });
    } else if (typeof contentProtection.protectPrinting.watermark === "string") {
      // Handle plain string (should be a translation key)
      resolvedWatermark = t(contentProtection.protectPrinting.watermark);
    }
  }
  
  // Construct the resolved config with proper types matching IContentProtectionConfig
  const resolved: IContentProtectionConfig = {
    protectCopy: contentProtection.protectCopy,
    disableContextMenu: contentProtection.disableContextMenu,
    disableDragAndDrop: contentProtection.disableDragAndDrop,
    protectPrinting: contentProtection.protectPrinting ? {
      disable: contentProtection.protectPrinting.disable,
      watermark: resolvedWatermark
    } : undefined,
    disableSelectAll: contentProtection.disableSelectAll,
    disableSave: contentProtection.disableSave,
    monitorDevTools: contentProtection.monitorDevTools
  };
  
  return resolved;
};

/**
 * Default content protection configuration
 */
export const defaultContentProtectionConfig: ContentProtectionConfig = {
  protectCopy: false,
  disableContextMenu: false,
  disableDragAndDrop: false,
  protectPrinting: {
    disable: false,
    watermark: "reader.app.printingDisabled"
  },
  disableSelectAll: false,
  disableSave: false,
  monitorDevTools: false
};

/**
 * Development content protection configuration - disables all protections
 */
export const devContentProtectionConfig: ContentProtectionConfig = {
  protectCopy: false,
  disableContextMenu: false,
  disableDragAndDrop: false,
  protectPrinting: {
    disable: false
  },
  disableSelectAll: false,
  disableSave: false,
  monitorDevTools: false
};