"use client";

import { useMemo } from "react";
import { usePlugins } from "@/components/Plugins/PluginProvider";

interface UseActionComponentStatusOptions {
  /** The action key to check */
  actionKey: string;
}

interface ActionComponentStatus {
  /** Whether the action is registered in the actions component map */
  isComponentRegistered: boolean;
}

/**
 * Generic hook to check if an action component is registered in the plugin registry.
 * This abstracts the common pattern of checking action component registration.
 * 
 * @param options - Configuration options for the action component status check
 * @returns Object containing status flags for the action component
 */
export function useActionComponentStatus(options: UseActionComponentStatusOptions): ActionComponentStatus {
  const { actionKey } = options;
  
  const { actionsComponentsMap, primaryAudioActionsMap } = usePlugins();

  return useMemo(() => {
    // Check if action is registered in either actions component map or primary audio actions map
    const isComponentRegistered = !!actionsComponentsMap?.[actionKey] || 
                                  !!primaryAudioActionsMap?.[actionKey];

    return {
      isComponentRegistered
    };
  }, [actionKey, actionsComponentsMap, primaryAudioActionsMap]);
}
