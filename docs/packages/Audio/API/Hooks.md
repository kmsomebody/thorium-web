# Audio Hooks API Reference

## useAudioNavigator

Provides access to the Readium `AudioNavigator` instance and all playback/navigation methods. See the [Core Hooks API](../../Core/API/Hooks.md#audio-navigator-hook) for the full interface reference.

> [!IMPORTANT]
> Import from `@edrlab/thorium-web/audio` when used alongside Stateful Components, not from `@edrlab/thorium-web/core/hooks`. All components must share the same navigator instance.

```tsx
import { useAudioNavigator } from "@edrlab/thorium-web/audio";

const MyControls = () => {
  const { play, pause, isPlaying, seek } = useAudioNavigator();

  return (
    <button onClick={ () => isPlaying() ? pause() : play() }>
      { isPlaying() ? "Pause" : "Play" }
    </button>
  );
};
```
