# Reader Hooks API Reference

## usePublication

Fetches a Readium Web Publication Manifest from a URL, parses it into a `Publication` object, and detects the publication profile. Must be used inside a `ThStoreProvider`.

```typescript
import { usePublication } from "@edrlab/thorium-web/reader";

const { publication, profile, localDataKey, isLoading, error } = usePublication({
  url: manifestUrl,
  onError: (error) => console.error(error)
});
```

**Parameters**

```typescript
interface UsePublicationOptions {
  url: string;
  onError?: (error: ProcessedError) => void;
  fetcher?: Fetcher;
}
```

**Returns**

```typescript
interface UsePublicationReturn {
  isLoading: boolean;
  error: ProcessedError | null;
  publication: Publication | null;
  manifest: object | null;
  selfLink: string | null;
  localDataKey: string | null;
  profile: "epub" | "webPub" | "audio" | null;
  isRTL: boolean;
  isFXL: boolean;
  hasDisplayTransformability: boolean;
}
```

Profile is detected from `conformsTo` in the manifest metadata — `"audio"` for audiobooks, `"epub"` for EPUB, `"webPub"` for everything else.

---

## usePositionStorage

Abstracts reading position persistence. Uses `localStorage` by default, or delegates to a custom `PositionStorage` implementation when provided.

```typescript
import { usePositionStorage } from "@edrlab/thorium-web/reader";

const { setLocalData, getLocalData, localData } = usePositionStorage(localDataKey, positionStorage);
```

**Parameters**

- `key`: `string | null` — the localStorage key (used when no custom storage is provided)
- `customStorage`: `PositionStorage` (optional) — a custom storage implementation

**Returns**

- `setLocalData`: `(locator: Locator | null) => void`
- `getLocalData`: `() => Locator | null`
- `localData`: `Locator | null` — the current stored position

---

## useReaderTransitions

Derives boolean transition flags from the reader's Redux state. Useful for reacting to state changes (e.g. entering/leaving immersive mode) without manually tracking previous values.

```typescript
import { useReaderTransitions } from "@edrlab/thorium-web/reader";

const { toImmersive, fromImmersive, isScroll } = useReaderTransitions();
```

**Returns**

```typescript
interface ReaderTransitions {
  // Current states
  isImmersive: boolean;
  isFullscreen: boolean;
  isScroll: boolean;
  hasUserNavigated: boolean;

  // Previous states
  wasImmersive: boolean;
  wasFullscreen: boolean;
  wasScroll: boolean;
  wasUserNavigated: boolean;

  // Transitions (previous → current)
  fromImmersive: boolean;
  toImmersive: boolean;
  fromFullscreen: boolean;
  toFullscreen: boolean;
  fromScroll: boolean;
  toScroll: boolean;
  fromUserNavigation: boolean;
  toUserNavigation: boolean;
}
```

---

## usePaginatedArrows

Computes the visibility and layout behaviour of pagination arrows based on preferences, breakpoint, FXL state, and reader transitions. Intended for use in custom arrow components.

```typescript
import { usePaginatedArrows } from "@edrlab/thorium-web/reader";

const { isVisible, occupySpace, shouldTrackNavigation, supportsVariant } = usePaginatedArrows();
```

**Returns**

```typescript
interface UsePaginatedArrowsReturn {
  isVisible: boolean;           // Whether arrows should be rendered visible
  occupySpace: boolean;         // True when variant is "stacked" (arrows take up layout space)
  shouldTrackNavigation: boolean; // True when arrows should hide after user navigation
  supportsVariant: boolean;     // False for FXL (always layered)
}
```

---

## useCoverBlobUrl

Fetches a cover image once and returns a stable blob URL. Both the theme extraction system and the cover image component receive the same URL, so the image is fetched exactly once and never reloaded on layout changes.

```typescript
import { useCoverBlobUrl } from "@edrlab/thorium-web/reader";

const { coverBlobUrl, coverReady } = useCoverBlobUrl(coverUrl);
```

**Parameters**

- `coverUrl`: `string | undefined` — the original cover URL (remote or relative)

**Returns**

- `coverBlobUrl`: `string | undefined` — a `blob:` URL backed by the fetched image, or `undefined` while loading or if the fetch failed
- `coverReady`: `boolean` — `true` once the blob is available, the fetch failed, or no `coverUrl` was provided. Use this to gate UI that depends on the cover being resolved.

On fetch failure the UI is unblocked (`coverReady` becomes `true`) and `coverBlobUrl` remains `undefined`, so the cover placeholder is shown. The fetch is aborted and the blob URL is revoked on cleanup.
