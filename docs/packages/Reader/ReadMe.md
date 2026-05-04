# Using the Reader package

The Reader package provides a wrapper component that conditionally renders the appropriate reader based on the publication profile (EPUB, WebPub, or Audio).

It automatically selects between EPUB, WebPub, and Audio readers while handling theme management, Redux integration, and accessibility features.

> [!Note]
> Thorium Web's packages are still a work in progress, and will be improved and extended in the future. Any help is appreciated if you'd like a component or a feature, or simply make it easier to use, and want to help.

## Installation

Thorium Web relies on peer dependencies to work. You must install them manually.

```bash
npm install @edrlab/thorium-web @readium/css @readium/navigator @readium/navigator-html-injectables @readium/shared react-redux @reduxjs/toolkit i18next i18next-browser-languagedetector i18next-http-backend motion react-aria react-aria-components react-stately react-modal-sheet react-resizable-panels
```

## Reader Component

The Reader Component is the main component of this package. It automatically selects and renders the appropriate reader component based on the publication profile.

You can use it like this:

```tsx
import { StatefulReaderWrapper, ThStoreProvider, ThPreferencesProvider, ThI18nProvider, usePublication } from "@edrlab/thorium-web/reader";

const App = ({ manifestUrl }) => {
  const { publication, localDataKey, isLoading, error } = usePublication({
    url: manifestUrl,
    onError: (error) => console.error("Publication loading error:", error)
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ThStoreProvider>
      <ThPreferencesProvider>
        <ThI18nProvider>
          <StatefulReaderWrapper
            profile="epub" // or "webPub" | "audio"
            publication={ publication }
            localDataKey={ localDataKey }
            positionStorage={{
              get: () => getStoredPosition(localDataKey),
              set: (locator) => storePosition(localDataKey, locator)
            }}
          />
        </ThI18nProvider>
      </ThPreferencesProvider>
    </ThStoreProvider>
  );
};
```

The Reader expects the following props:

- `profile`: `"epub" | "webPub" | "audio" | undefined | null` - The publication profile to determine which reader to render
- `publication`: `Publication` - The Readium Publication object containing the publication data
- `localDataKey`: `string | null` - A unique key for storing local reading data (bookmarks, positions, etc.) – can be overridden through positionStorage
- `positionStorage`: `PositionStorage` (optional) - An interface for persisting reading positions

> [!IMPORTANT]
> Due to the complexity the reader has to handle, it does not currently accept `children`. This also explains why it requires dependencies (Redux, Preferences) and is not directly stylable. We are hopeful these limitations may be removed in the future but it will require some additional effort. If you have any ideas, please let us know. In the meantime, you can build your own reader component if you want to use the other components exported from this package.

It is critical you wrap this component in a `<ThStoreProvider>`, a `<ThPreferencesProvider>`, and a `<ThI18nProvider>`, in this order, for it to work properly.

> [!CAUTION]
> When using this `<StatefulReaderWrapper>` and all other components from `@edrlab/thorium-web/reader`, you must use the `<ThStoreProvider>`, `<ThPreferencesProvider>`, and `<ThI18nProvider>` from this same path, and not their specific ones.
> If you do not, they will not work as expected as your app will use specific providers that are not shared with the Stateful Components.

### PositionStorage Interface

```typescript
interface PositionStorage {
  get: () => Locator | undefined; // Get current reading position
  set: (locator: Locator) => void | Promise<void>; // Set reading position
}
```

### Supported Profiles

- **"epub"**: Renders the EPUB StatefulReader with FXL or reflow rendition
- **"webPub"**: Renders the WebPub ExperimentalStatefulReader  
- **"audio"**: Placeholder for future audio reader implementation

### Features

- **Conditional Rendering**: Automatically renders EPUB, WebPub, or Audio readers based on profile
- **Theme Management**: Initializes the theme system automatically
- **Preferences Management**: Sets up preferences for each profile
- **Redux State Management**: Integrates with Thorium's Redux store for theme, publication, and settings state
- **Accessibility**: Manages breakpoints, color schemes, contrast, and motion preferences
- **Position Storage**: Optional interface for overriding the built-in position persistence
