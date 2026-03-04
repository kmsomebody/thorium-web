import { useMemo } from "react";
import { usePlugins } from "@/components/Plugins/PluginProvider";
import { usePreferences } from "@/preferences/hooks/usePreferences";
import { ThSettingsKeys, ThTextSettingsKeys, ThSpacingSettingsKeys } from "@/preferences/models";

interface UseSettingsComponentStatusOptions {
  /** The settings key to check (e.g., ThSettingsKeys.spacingPresets) */
  settingsKey: ThSettingsKeys | ThTextSettingsKeys | ThSpacingSettingsKeys;
  /** The publication type to determine which order array to check */
  publicationType?: "reflow" | "fxl" | "webpub";
  /** Whether this is a text or spacing component to check the correct panels */
  componentType?: "text" | "spacing";
  /** Optional additional condition that must be true for the component to be considered displayed */
  additionalCondition?: boolean;
}

interface SettingsComponentStatus {
  /** Whether the component is registered in the component map */
  isComponentRegistered: boolean;
  /** Whether the component is included in the main panel display order */
  isInMainPanel: boolean;
  /** Whether the component is included in the sub-panel display order */
  isInSubPanel: boolean;
  /** Whether the component is displayed (in either panel and meets additional conditions) */
  isDisplayed: boolean;
  /** Whether the component is currently being used (both registered AND displayed) */
  isComponentUsed: boolean;
}

/**
 * Generic hook to check if a settings component is registered and displayed.
 * This abstracts the common pattern of checking component registration and display order.
 * 
 * @param options - Configuration options for the component status check
 * @returns Object containing various status flags for the component
 */
export function useSettingsComponentStatus(options: UseSettingsComponentStatusOptions): SettingsComponentStatus {
  const { settingsKey, publicationType, componentType, additionalCondition = true } = options;
  
  const { spacingSettingsComponentsMap, textSettingsComponentsMap, settingsComponentsMap } = usePlugins();
  const { preferences } = usePreferences();

  return useMemo(() => {
    // 1. Check if component is registered in any of the component maps
    const isComponentRegistered = !!(
      settingsComponentsMap?.[settingsKey] ||
      spacingSettingsComponentsMap?.[settingsKey] ||
      textSettingsComponentsMap?.[settingsKey]
    );

    // 2. Check if component is in the correct display order array based on publication type
    let isInOrder = false;
    switch (publicationType) {
      case "reflow":
        isInOrder = preferences.settings?.reflowOrder?.includes(settingsKey as ThSettingsKeys) || false;
        break;
      case "fxl":
        isInOrder = preferences.settings?.fxlOrder?.includes(settingsKey as ThSettingsKeys) || false;
        break;
      case "webpub":
        isInOrder = preferences.settings?.webPubOrder?.includes(settingsKey as ThSettingsKeys) || false;
        break;
    }
    
    // 3. Check if component is in the correct panels based on component type
    let isInMainPanel = false;
    let isInSubPanel = false;
    
    if (componentType === "text") {
      isInMainPanel = preferences.settings?.text?.main?.includes(settingsKey as any) || false;
      isInSubPanel = preferences.settings?.text?.subPanel?.includes(settingsKey as any) || false;
    } else if (componentType === "spacing") {
      isInMainPanel = preferences.settings?.spacing?.main?.includes(settingsKey as any) || false;
      isInSubPanel = preferences.settings?.spacing?.subPanel?.includes(settingsKey as any) || false;
    }
    
    // 4. Component is displayed if it's in order array and in any panel
    const isDisplayed = isInOrder || (isInMainPanel || isInSubPanel) && additionalCondition;

    // 5. Component is used if it's both registered AND displayed
    const isComponentUsed = isComponentRegistered && isDisplayed;

    return {
      isComponentRegistered,
      isInMainPanel,
      isInSubPanel,
      isDisplayed,
      isComponentUsed
    };
  }, [
    settingsKey,
    publicationType,
    componentType,
    additionalCondition,
    preferences,
    spacingSettingsComponentsMap,
    textSettingsComponentsMap,
    settingsComponentsMap
  ]);
}
