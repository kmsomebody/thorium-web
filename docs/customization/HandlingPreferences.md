# Handling Preferences

In case you need to use the Preferences package, you can use the following helpers to create and merge preferences objects.

It also provides a `PreferencesProvider` component that makes the preferences available to all components, as well as a context hook, `usePreferences()`, that allows you to access and update the preferences.

## Create Preferences

The `createPreferences` helper allows you to create a new preferences object with your own custom configuration. This is the primary way to set up the preferences for your Thorium Web implementation.

### Basic Usage

```typescript
import { createPreferences } from "@edrlab/thorium-web/preferences";

// Create preferences with default keys
const prefs = createPreferences({
  direction: "ltr",
  locale: "en-US"
});
```

### Custom Action Keys

Let’s imagine you need to add a custom action key to the preferences. You can do this by following these steps:

1. Define your action keys
2. Extend `CustomizableKeys`
3. Create preferences with your custom keys type

```typescript
import { createPreferences, CustomizableKeys } from "@edrlab/thorium-web/preferences";
import { ThActionsKeys } from "@edrlab/thorium-web/preferences/models/enums";

// 1. Define your action keys
enum MyActions {
  customAction = "customAction"
}

// 2. Extend CustomizableKeys
type MyKeys = {
  action: MyActions | ThActionsKeys;  // Include default actions
} & CustomizableKeys;

// 3. Create preferences
const prefs = createPreferences<MyKeys>({
  actions: {
    reflowOrder: [ThActionsKeys.settings, MyActions.customAction],
    keys: {
      [MyActions.customAction]: {
        visibility: "always",
        shortcut: null
      }
    }
  }
});
```

## Using the Provider

The `ThPreferencesProvider` component provides a React context for accessing Thorium Web preferences throughout your application. It serves as the central point for managing and distributing preference settings to all components.

```typescript
import { ThPreferencesProvider } from "@edrlab/thorium-web/preferences";

function App() {
  return (
    <ThPreferencesProvider 
      adapter={ yourAdapter }  // Optional: custom adapter for persistence
      devMode={ true }  // Optional: enable dev mode
      initialPreferences={ prefs }  // Optional: initial preferences
    >
      <YourApp />
    </ThPreferencesProvider>
  );
}
```

### Provider Props

- `adapter?`: Optional custom adapter for persisting preferences
- `devMode?`: Optional boolean to enable dev mode – this will turn every content protection setting to `false`
- `initialPreferences?`: Optional initial preferences object – note this will override the default preferences and the dev mode
- `children`: Your application components

## Accessing Preferences

```typescript
import { usePreferences } from "@edrlab/thorium-web/preferences";

function MyComponent() {
  const { preferences } = usePreferences<MyKeys>();
  
  // Read preferences
  const { direction } = preferences;
}
```

## Updating Preferences

The `updatePreferences` function allows you to update preferences values. It expects a complete preferences object.

```typescript
import { updatePreferences } from "@edrlab/thorium-web/preferences";

function MyComponent() {
  const { preferences } = usePreferences<MyKeys>();

  const handleUpdate = () => {
    updatePreferences({
      ...preferences,
      direction: "rtl"
    });
  };

  return (
    <button onClick={ handleUpdate }>Update Direction</button>
  );
}
```

### Important Notes

- The provider should be placed high in your component tree
- Use a custom adapter for persistence if needed
- The `usePreferences` hook is read-only - updates should be handled through your adapter
- You can nest multiple providers to override preferences for specific parts of your application