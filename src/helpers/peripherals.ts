// Peripherals based on XBReader
import { ThActionsPref, DefaultKeys } from "@/preferences";

import { ThActionsKeys } from "@/preferences/models";

import { buildShortcut, UnstablePShortcut } from "@/core/Helpers/keyboardUtilities";
import { isInteractiveElement } from "@/core/Helpers/focusUtilities";

import { useAppStore } from "@/lib/hooks";

export interface PCallbacks {
  moveTo: (direction: "left" | "right" | "up" | "down" | "home" | "end") => void;
  goProgression: (shiftKey?: boolean) => void;
  toggleAction: (action: ThActionsKeys) => void;
}

export interface PShortcuts {
  [key: string]: {
    actionKey: ThActionsKeys;
    modifiers: UnstablePShortcut["modifiers"];
  }
}

export default class Peripherals {
  private readonly observers = ["keydown"];
  private targets: EventTarget[] = [];
  private readonly callbacks: PCallbacks;
  private readonly store: ReturnType<typeof useAppStore>;
  private readonly actionsPref: ThActionsPref<DefaultKeys> | undefined;
  private readonly shortcuts: PShortcuts;

  constructor(store: ReturnType<typeof useAppStore>, actionsPref: ThActionsPref<DefaultKeys> | undefined, callbacks: PCallbacks) {
    this.observers.forEach((method) => {
      (this as any)["on" + method] = (this as any)["on" + method].bind(this);
    });
    this.store = store;
    this.actionsPref = actionsPref;
    this.callbacks = callbacks;
    this.shortcuts = this.retrieveShortcuts();
  }

  private getPlatformModifier(): "ctrlKey" | "metaKey" {
    return this.store.getState().reader.platformModifier.modifier;
  }

  private retrieveShortcuts() {
    if (!this.actionsPref) return {};

    const shortcutsObj: PShortcuts = {};

    const displayOrder = this.store.getState().publication.isFXL
      ? this.actionsPref.fxlOrder
      : this.actionsPref.reflowOrder;

    for (const actionKey of displayOrder) {
      const shortcutString = this.actionsPref.keys[actionKey].shortcut;
      
      if (shortcutString) {
        const shortcutObj = buildShortcut(shortcutString);

        if (shortcutObj?.key) {
          Object.defineProperty(shortcutsObj, shortcutObj.key, {
            value: {
              actionKey: actionKey,
              modifiers: shortcutObj.modifiers
            },
            writable: false,
            enumerable: true
          });
        }
      }
    };
    
    return shortcutsObj;
  }

  destroy() {
    this.targets.forEach((t) => this.unobserve(t));
  }

  unobserve(item: EventTarget) {
    if (!item) return;
    this.observers.forEach((EventName) => {
      item.removeEventListener(
        EventName,
        (this as any)["on" + EventName],
        false
      );
    });
    this.targets = this.targets.filter((t) => t !== item);
  }

  observe(item: EventTarget) {
    if (!item) return;
    if (this.targets.includes(item)) return;
    this.observers.forEach((EventName) => {
      item.addEventListener(EventName, (this as any)["on" + EventName], false);
    });
    this.targets.push(item);
  }

  onkeydown(e: KeyboardEvent) {
    const focusIsSafe = !isInteractiveElement(document.activeElement);
    
    switch(e.code) {
      case "Space":
        focusIsSafe && this.callbacks.goProgression(e.shiftKey);
        break;
      case "ArrowRight":
        focusIsSafe && this.callbacks.moveTo("right");
        break;
      case "ArrowLeft":
        focusIsSafe && this.callbacks.moveTo("left");
        break;
      case "ArrowUp":
      case "PageUp":
        focusIsSafe && this.callbacks.moveTo("up");
        break;
      case "ArrowDown":
      case "PageDown":
        focusIsSafe && this.callbacks.moveTo("down");
        break;
      case "Home":
        focusIsSafe && this.callbacks.moveTo("home");
        break;
      case "End":
        focusIsSafe && this.callbacks.moveTo("end");
        break;
      default:
        if (this.shortcuts.hasOwnProperty(e.code)) {
          const customShortcutObj = this.shortcuts[e.code];
          const sendCallback = Object.entries(customShortcutObj.modifiers).every(( [modifier, value] ) => {
            if (modifier === "platformKey") {
              return e[this.getPlatformModifier()] === value;
            } else {
              return e[modifier as "altKey" | "ctrlKey" | "metaKey" | "shiftKey"] === value;
            }
          })
            
          if (sendCallback) {
            e.preventDefault();
            this.callbacks.toggleAction(customShortcutObj.actionKey)
          };
        }
        break;
    }
  }
}