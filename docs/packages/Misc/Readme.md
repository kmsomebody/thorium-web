# Utility Components

This package provides with some utility components that are not part of the Reader Component.

## StatefulLoader

Loading indicator component.

```typescript
interface StatefulLoaderProps {
  isLoading: boolean;     // Loading state
  children: ReactNode;    // Content to show when loaded
}
```

Features:
- Loading state management
- Localized loading message
- Accessible loading indicators

## ErrorDisplay

Error display component for showing user-friendly error messages.

```typescript
interface ErrorDisplayProps {
  message: string;        // Error message to display
  title?: string;         // Optional title (defaults to "Error")
  children?: ReactNode;   // Optional additional content
}
```

Features:
- User-friendly error message display
- Localized error titles
- Consistent styling with the app's design system
- Support for additional content/actions

## PublicationGrid

Publication grid component for displaying a list of publications in a responsive grid layout.

```typescript
interface PublicationGridProps {
  publications: Publication[];  // List of publication objects to display
  columnWidth?: number;         // Minimum width of each grid column in pixels (default: 400)
  gap?: string;                 // Gap between grid items (default: "1.5rem")
  renderCover?: (publication: Publication) => React.ReactElement<React.ImgHTMLAttributes<HTMLImageElement>>; // Custom cover renderer function
}

interface Publication {
  title: string;      // Title of the publication
  author: string;     // Author of the publication
  cover: string;      // URL to the cover image
  url: string;        // URL to the publication
  rendition?: string; // Optional rendition information
}
```

Features:
- Responsive grid layout that adapts to different screen sizes
- Customizable column width and gaps
- Hover effects and transitions
- Accessible semantic HTML structure
- Support for custom cover rendering