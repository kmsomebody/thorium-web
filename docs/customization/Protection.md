# Content Protection

Contents can be protected in several ways, including:

- disabling drag and drop
- disabling right click
- disabling save
- disabling print
- disabling copy
- disabling select all
- monitoring developer tools
- And more in the future…

Preferences can be set to enable or disable these protections.

```typescript
const preferences = {
  ...,
  contentProtection: {
    protectCopy: true,
    disableContextMenu: true,
    disableDragAndDrop: true,
    protectPrinting: {
      disable: true,
      watermark: "reader.app.printingDisabled"
    },
    disableSelectAll: true,
    disableSave: true,
    monitorDevTools: true
  }
};
```

## Protect Copy

Protect copy prevents users from copying text from content. It accepts a boolean value, or an object for fine-grained control:

```typescript
// Simple boolean
protectCopy: true // Disables copying entirely

// Fine-grained control
protectCopy: {
  maxSelectionPercent: 0.5,        // Maximum 50% of content can be selected
  minThreshold: 10,                // Minimum 10 characters before protection kicks in
  absoluteMaxChars: 1000,          // Maximum 1000 characters total
  historySize: 5                   // Keep 5 recent attempts for analysis
}
```

## Disable Context Menu

Disables the right-click context menu to prevent access to browser functions like copy, save, etc.

```typescript
disableContextMenu: true
```

## Disable Drag and Drop

Prevents users from dragging content or dropping files onto the content area.

```typescript
disableDragAndDrop: true
```

## Protect Printing

Controls printing functionality with optional watermark:

```typescript
protectPrinting: {
  disable: true,
  watermark: "reader.app.printingDisabled"  // Translation key for watermark text
}
```

## Disable Select All

Prevents users from using Ctrl+A/Cmd+A to select all content.

```typescript
disableSelectAll: true
```

## Disable Save

Disables keyboard shortcuts for saving (Ctrl+S/Cmd+S).

```typescript
disableSave: true
```

## Monitor Developer Tools

Monitors for suspicious activity related to developer tools being opened. Used for shortcut protection at the moment, but will be expanded in the future.

```typescript
monitorDevTools: true
```

## Development Mode

When using the `devMode` prop in `ThPreferencesProvider`, all content protection settings are automatically set to `false` to facilitate development and testing.

```typescript
<ThPreferencesProvider devMode={ true }>
  <YourApp />
</ThPreferencesProvider>
```

Note: `initialPreferences` values will override both default preferences and dev mode, so you will have to handle that manually if you want a dev mode with your custom preferences.