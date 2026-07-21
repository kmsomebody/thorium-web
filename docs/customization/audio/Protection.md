# Audio Content Protection

Audio content protection is configured through the `contentProtection` property in `ThAudioPreferences`. It works the same as the [standard content protection](./Protection.md), with one difference: `protectCopy` only accepts a `boolean`. Fine-grained selection control is not available for audio since audio does not support text selection.

```typescript
contentProtection: {
  protectCopy: true,          // boolean only, no fine-grained object
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
```

Pass `devMode` to `ThAudioPreferencesProvider` to disable all content protection during development.
