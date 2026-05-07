# Handling Audio Preferences

Audio uses a separate preferences system from EPUB and WebPub. Use `createAudioPreferences` and `ThAudioPreferencesProvider` instead of their EPUB/WebPub equivalents.

## Create Audio Preferences

The `createAudioPreferences` helper creates a validated `ThAudioPreferences` object. It warns at runtime about:

- unreachable slider presets given the configured `range` and `step`
- conflicting skip interval keys (`skipInterval` used alongside `skipBackwardInterval` or `skipForwardInterval`)
- secondary action keys present in `displayOrder` but missing from `keys`

```typescript
import { createAudioPreferences } from "@edrlab/thorium-web/audio";

const myPreferences = createAudioPreferences({
  // ... your audio preferences
});
```

## Custom Action Keys

You can extend the audio actions by adding custom keys:

```typescript
import { createAudioPreferences, AudioCustomizableKeys, ThAudioActionKeys } from "@edrlab/thorium-web/audio";

enum MyAudioActions {
  bookmark = "audio.bookmark"
}

type MyAudioKeys = {
  audioAction: MyAudioActions | ThAudioActionKeys;
} & AudioCustomizableKeys;

const prefs = createAudioPreferences<MyAudioKeys>({
  actions: {
    ...,
    secondary: {
      displayOrder: [ThAudioActionKeys.toc, MyAudioActions.bookmark],
      keys: {
        [MyAudioActions.bookmark]: {
          visibility: "always",
          shortcut: null
        }
      }
    }
  }
});
```

## Using the Provider

```typescript
import { ThAudioPreferencesProvider } from "@edrlab/thorium-web/audio";

function App() {
  return (
    <ThAudioPreferencesProvider
      adapter={ yourAdapter }        // Optional: custom adapter for persistence
      devMode={ true }               // Optional: enable dev mode
      initialPreferences={ prefs }   // Optional: initial preferences
    >
      <YourApp />
    </ThAudioPreferencesProvider>
  );
}
```

### Provider Props

- `adapter?`: Optional custom adapter for persisting preferences
- `devMode?`: Optional boolean to enable dev mode — this will disable all content protection settings
- `initialPreferences?`: Optional initial preferences object — note this will override the default preferences and dev mode
- `children`: Your application components

## Accessing Preferences

```typescript
import { useAudioPreferences } from "@edrlab/thorium-web/audio";

function MyComponent() {
  const { preferences, updatePreferences } = useAudioPreferences();

  const { settings } = preferences;
}
```
