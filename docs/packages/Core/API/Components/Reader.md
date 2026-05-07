# Reader Components API Documentation

## ThFooter

A footer component for the reader interface.

### Props

```typescript
type ThFooterProps = HTMLAttributesWithRef<HTMLDivElement>
```

## ThHeader

A header component for the reader interface.

### Props

```typescript
type ThHeaderProps = HTMLAttributesWithRef<HTMLDivElement>
```

## ThLoader

A loading indicator component with accessibility support.

### Props

```typescript
interface ThLoaderProps extends Omit<HTMLAttributesWithRef<HTMLDivElement>, "aria-busy" | "aria-live"> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  isLoading: boolean;      // Controls loader visibility
  loader: ReactNode;       // Loading indicator content
}
```

### Features

- Automatic ARIA attributes management
- Conditional rendering of loader content
- Live region support for screen readers

## ThInteractiveOverlay

A component for creating interactive overlays e.g. tap/click zones, hover zones, etc.

### Props

```typescript
interface ThInteractiveOverlayProps extends HTMLAttributesWithRef<HTMLDivElement> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  isActive: boolean;
}
```

### Features

- Conditional rendering of the invisible overlay
- Accepts all props from `HTMLAttributesWithRef<HTMLDivElement>`

## ThPagination

A layout-only pagination component with `left` and `right` slots. The caller is responsible for mapping semantic navigation (previous/next) to the correct slot based on publication direction.

### Props

```typescript
interface ThPaginationLinkProps {
  icon?: ComponentType<SVGProps<SVGElement>> | null; // overrides the default arrow icon
  node: React.ReactNode;
  onPress: () => void;
}

interface ThPaginationProps extends HTMLAttributesWithRef<HTMLDivElement> {
  ref?: React.RefObject<HTMLDivElement>;
  links?: {
    left?: ThPaginationLinkProps;  // renders icon-then-text, default ArrowBack
    right?: ThPaginationLinkProps; // renders text-then-icon, default ArrowForward
  };
  children?: React.ReactNode;
  compounds?: {
    listItem?: React.HTMLAttributes<HTMLLIElement>;
    leftButton?: Exclude<WithRef<ButtonProps, HTMLButtonElement>, "type">;
    rightButton?: Exclude<WithRef<ButtonProps, HTMLButtonElement>, "type">;
  };
}
```

### Features

- Semantic `<nav>` structure
- `left` slot: icon on the leading edge (default `ArrowBack`), then node
- `right` slot: node first, then icon on the trailing edge (default `ArrowForward`)
- Icon can be overridden per link via the `icon` prop
- `children` renders in the center slot between left and right
- Direction-agnostic: LTR/RTL mapping is the caller's responsibility

## ThProgression

A component for displaying reader progression.

### Props

```typescript
interface ThProgressionProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.RefObject<HTMLDivElement>
}
```

## ThRunningHead

A component for displaying the current running head in the top bar.

### Props

```typescript
interface ThRunningHeadProps extends HTMLAttributesWithRef<HTMLHeadingElement> {
  ref?: React.RefObject<HTMLHeadingElement>
  label: string;           // Heading text content
}
```

### Features

- Automatic document title synchronization
- Semantic heading structure
- Accessibility support

## Accessibility

All reader components implement ARIA best practices:

- Proper heading structure
- Live regions for dynamic content
- ARIA attributes for loading states
- Semantic HTML elements