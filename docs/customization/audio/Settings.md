# Audio Settings

Audio settings are configured through `ThAudioPreferences`. Use enum `ThAudioKeys` to reference them.

## Display Order

The `settings.order` array controls which settings are shown in the audio settings panel and in what order:

```typescript
import { ThAudioKeys } from "@edrlab/thorium-web/audio";

settings: {
  order: [
    ThAudioKeys.skipInterval,
    ThAudioKeys.autoPlay,
    ThAudioKeys.sleepTimer
  ]
}
```

> [!NOTE]
> Use either `ThAudioKeys.skipInterval` **or** the pair `ThAudioKeys.skipBackwardInterval` + `ThAudioKeys.skipForwardInterval` — not both.

## Keys

The `settings.keys` object configures each audio setting. `ThAudioKeys.volume` and `ThAudioKeys.playbackRate` are always available as primary-zone controls and do not need to appear in `order`.

### Range Settings

`volume`, `playbackRate`, `skipInterval`, `skipBackwardInterval`, and `skipForwardInterval` accept a `ThSettingsRangePrefRequired` object:

- `variant`: from enum `ThSettingsRangeVariant` (`slider`, `incrementedSlider`, `sliderWithPresets`, `presetsGroup`, or `numberField`)
- `range`: the min and max values, as `[number, number]`
- `step`: the step value, as `number`
- `placeholder` (optional): from enum `ThSettingsRangePlaceholder`, or a `string`, or an object with `key` and `fallback` properties
- `presets` (optional, required for `sliderWithPresets` and `presetsGroup`): array of preset values reachable within the configured `range` and `step`

`presetsGroup` renders only the preset buttons without a slider, which is the default for `skipInterval`, `skipBackwardInterval`, and `skipForwardInterval`.

For instance:

```typescript
settings: {
  keys: {
    [ThAudioKeys.playbackRate]: {
      variant: ThSettingsRangeVariant.sliderWithPresets,
      range: [0.5, 2],
      step: 0.05,
      presets: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    },
    [ThAudioKeys.skipInterval]: {
      variant: ThSettingsRangeVariant.presetsGroup,
      range: [5, 60],
      step: 5,
      presets: [5, 10, 30]
    }
  }
}
```

> [!NOTE]
> `createAudioPreferences` will warn at runtime if any preset value is not reachable given the configured `range` and `step`.

### Sleep Timer

`sleepTimer` accepts a `ThSettingsTimerPref` object. There are two variants:

- `ThSettingsTimerVariant.presetList`: displays a list of preset durations (in minutes)
- `ThSettingsTimerVariant.durationField`: displays a duration input field with an optional `maxHours` cap

The `presets` array accepts numbers (minutes) or the special `"endOfResource"` string, which pauses playback at the end of the current track.

```typescript
// Preset list
[ThAudioKeys.sleepTimer]: {
  variant: ThSettingsTimerVariant.presetList,
  presets: [15, 30, 45, 60, 90, "endOfResource"]
}

// Duration field
[ThAudioKeys.sleepTimer]: {
  variant: ThSettingsTimerVariant.durationField,
  maxHours: 23
}
```

