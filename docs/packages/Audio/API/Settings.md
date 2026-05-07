# Audio Settings API Reference

Audio settings components connect directly to the audio navigator and Redux state. They render the appropriate control variant (slider, slider with presets, or number field) based on the `settings.keys` configuration in `ThAudioPreferences`.

All components accept a `standalone` prop. When `true` (the default), the component renders without additional wrapper styling — useful when embedding outside the default settings panel.

## StatefulAudioAutoPlay

Toggle for continuous play. When enabled, the player automatically loads and plays the next track when the current one ends. When disabled, the next track is loaded but playback does not start automatically.

```typescript
interface StatefulAudioAutoPlayProps {
  standalone?: boolean;
}
```

Reads and updates `audioSettings.autoPlay` in Redux, and submits `autoPlay` to the navigator preferences.

## StatefulAudioSkipInterval

Unified skip interval control — sets both forward and backward skip durations to the same value.

```typescript
interface StatefulAudioSkipIntervalProps {
  standalone?: boolean;
}
```

Renders as a slider, slider with presets, or number field depending on `settings.keys.skipInterval.variant`. Updates both `skipForwardInterval` and `skipBackwardInterval` in Redux simultaneously.

> [!NOTE]
> Use either `StatefulAudioSkipInterval` **or** the pair `StatefulAudioSkipBackwardInterval` + `StatefulAudioSkipForwardInterval` — not both. Including both in `settings.order` will trigger a console warning from `createAudioPreferences`.

## StatefulAudioSkipBackwardInterval

Independent control for the backward skip duration.

```typescript
interface StatefulAudioSkipBackwardIntervalProps {
  standalone?: boolean;
}
```

Renders based on `settings.keys.skipBackwardInterval.variant`. Updates only `skipBackwardInterval` in Redux.

## StatefulAudioSkipForwardInterval

Independent control for the forward skip duration.

```typescript
interface StatefulAudioSkipForwardIntervalProps {
  standalone?: boolean;
}
```

Renders based on `settings.keys.skipForwardInterval.variant`. Updates only `skipForwardInterval` in Redux.

## Common Features

All settings components share these characteristics:

- **Preference Integration**: Direct integration with the preferences system
- **Audio Navigation**: Real-time updates to the audio player
- **Redux State**: Centralized state management for applied settings
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Styling**: Consistent styling through CSS modules
