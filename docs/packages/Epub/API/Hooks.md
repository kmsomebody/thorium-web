# Hooks API Reference

## usePublication

The `usePublication` hook is a custom hook that provides a way to fetch the Readium Web Publication Manifest from a given URL. It returns the parsed publication, manifest data, self-link, local data key, and other metadata that the `StatefulReader` component uses to load and navigate the publication.

The `onError` callback is an optional callback that is called with the error message if the fetch fails.

```typescript
interface UsePublicationOptions {
  url: string;
  onError?: (error: string) => void;
  fetcher?: Fetcher;
}

interface UsePublicationReturn {
  // Loading states
  isLoading: boolean;
  error: string;
  
  // Publication data
  publication: Publication | null;
  manifest: object | null;
  selfLink: string | null;
  localDataKey: string;
  
  // Profile detection
  profile: ReaderProfile | null;
  
  // Publication metadata
  isRTL: boolean;
  isFXL: boolean;
  fontLanguage: string;
  hasDisplayTransformability: boolean;
}
```

Features:
- Fetches the Readium Web Publication Manifest from a given URL
- Parses the manifest into a Publication object
- Extracts the self-link from the manifest
- Generates a local data key for storing reader state
- Detects publication profile (epub, webPub, audio)
- Provides publication metadata (RTL, FXL, font language, etc.)
- Error handling