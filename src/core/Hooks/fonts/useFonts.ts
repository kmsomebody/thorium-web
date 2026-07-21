"use client";

import { useCallback, useEffect, useRef } from "react";

import { InjectableFontResources } from "@/preferences/services/fonts";
import { ILinkInjectable, IUrlInjectable, IBlobInjectable } from "@readium/navigator";

import { getPlatform } from "@/core/Helpers/getPlatform";
import { getAndroidPatchCss } from "./androidPatchCss";

type FontResource = (ILinkInjectable & IUrlInjectable) | (ILinkInjectable & IBlobInjectable);

export const useFonts = (fontResources?: InjectableFontResources | null) => {
  const injectedElementsRef = useRef<{
    prepend: HTMLElement[];
    append: HTMLElement[];
  }>({
    prepend: [],
    append: []
  });

  const createLinkElement = useCallback((resource: FontResource): HTMLLinkElement => {
    const link = document.createElement("link");
    
    // Set all custom attributes first to make sure they are
    // overridden by the core attributes
    if ("attributes" in resource && resource.attributes) {
      Object.entries(resource.attributes).forEach(([key, value]) => {
        link.setAttribute(key, value as string);
      });
    }
    
    link.rel = resource.rel;
    link.as = resource.as;
    
    if ("url" in resource) {
      link.href = resource.url;
    } else if ("blob" in resource && resource.blob) {
      link.href = URL.createObjectURL(resource.blob);
    }
    
    return link;
  }, []);

  const removeInjectedElements = useCallback(() => {
    const { prepend, append } = injectedElementsRef.current;
    
    [...prepend, ...append].forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      // Revoke blob URLs to prevent memory leaks
      if (element instanceof HTMLLinkElement && element.href.startsWith("blob:")) {
        URL.revokeObjectURL(element.href);
      }
    });
    
    injectedElementsRef.current = {
      prepend: [],
      append: []
    };
  }, []);

  const injectFontResources = useCallback((resources: InjectableFontResources | null) => {
    if (typeof document === "undefined") return;
    
    removeInjectedElements();
    
    if (!resources) return;
    
    const { prepend, append } = resources;
    const injectedElements = injectedElementsRef.current;
    
    prepend.forEach(resource => {
      const element = createLinkElement(resource);
      document.head.insertBefore(element, document.head.firstChild);
      injectedElements.prepend.push(element);
    });
    
    append.forEach(resource => {
      const element = createLinkElement(resource);
      document.head.appendChild(element);
      injectedElements.append.push(element);
    });
  }, [createLinkElement, removeInjectedElements]);

  const getAndroidFXLPatch = useCallback((): (ILinkInjectable & IBlobInjectable) | null => {
    const platform = getPlatform();
    const isAndroid = platform === "android";
    
    if (!isAndroid) {
      return null;
    }
    
    const cssContent = getAndroidPatchCss();
    const blob = new Blob([cssContent], { type: "text/css" });
    
    return {
      as: "link",
      rel: "stylesheet",
      blob
    };
  }, []);

  useEffect(() => {
    injectFontResources(fontResources || null);
    
    return () => {
      removeInjectedElements();
    };
  }, [fontResources, injectFontResources, removeInjectedElements]);

  return {
    injectFontResources,
    removeFontResources: removeInjectedElements,
    getAndroidFXLPatch
  };
};