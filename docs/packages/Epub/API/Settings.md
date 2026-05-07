# Settings API Documentation

The Settings API provides a comprehensive set of components for managing EPUB reader settings, including text formatting, spacing, and layout preferences. The components are organized into base components (located in `/src/components/Settings/`) and EPUB-specific components (located in `/src/components/Epub/Settings/`).

## Base Components

### StatefulGroupWrapper

A wrapper component for grouping related settings with advanced options.

```typescript
interface StatefulGroupWrapperProps {
  label: string;
  moreLabel: string;
  moreTooltip: string;
  onPressMore: (e: PressEvent) => void;
  componentsMap: Record<string, SettingComponent>;
  prefs?: ThSettingsGroupPref<ThTextSettingsKeys | ThSpacingSettingsKeys>;
  defaultPrefs: {
    main: ThTextSettingsKeys[] | ThSpacingSettingsKeys[];
    subPanel: ThTextSettingsKeys[] | ThSpacingSettingsKeys[];
  };
  compounds?: {
    heading?: React.ReactElement<typeof Heading> | WithRef<HeadingProps, HTMLHeadingElement>;
  };
}
```

**Features:**
- Groups related settings components
- Provides advanced options subpanel
- Custom heading support
- Manages preferences and defaults
- Integrates with the plugin system

### StatefulDropdown

A dropdown menu component for selecting from predefined options.

```typescript
interface StatefulDropdownProps extends Omit<ThDropdownProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Dropdown menu with selectable options
- Keyboard navigation
- Accessibility support


### StatefulNumberField

A numeric input field component for precise value control.

```typescript
interface StatefulNumberFieldProps extends Omit<ThNumberFieldProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Precise numeric input
- Step control
- Range validation
- Accessibility support

### StatefulRadioGroup

A radio group component for selecting from predefined options.

```typescript
interface StatefulRadioGroupProps extends Omit<ThRadioGroupProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Accessible labeling

### StatefulPresetsGroup

A preset button group for selecting a numeric value from a fixed list, without a slider. Built on top of `StatefulRadioGroup`.

```typescript
interface StatefulPresetsGroupProps extends Omit<StatefulRadioGroupProps, "items" | "value" | "onChange"> {
  presets: number[];
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
  formatValue?: (value: number) => string;
  onChange?: (value: number) => void;
}
```

**Features:**
- Number-to-string conversion for radio group compatibility
- Optional `formatOptions` or `formatValue` for preset labels
- Inherits grid layout and keyboard navigation from `StatefulRadioGroup`

### StatefulSlider

A slider component for numeric settings with customizable styling.

```typescript
interface StatefulSliderProps extends Omit<ThSliderProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Accessible label and ARIA support
- Integrated output display

### StatefulSwitch

A toggle switch component for boolean settings.

```typescript
interface StatefulSwitchProps extends Omit<ThSwitchProps, "classNames"> {
  standalone?: boolean;
}
```

**Features:**
- Optional heading display
- Accessible labeling

## EPUB-Specific Components

### Layout Settings

#### StatefulColumns

```typescript
interface StatefulColumnsProps {}
```

**Features:**
- Controls column layout for EPUB content (auto, single, double)
- Integrates with scroll and fixed-layout modes
- Provides visual icons for layout options
- Real-time column count updates
- Accessibility support with ARIA labels

**Example:**
```typescript
<StatefulColumns />
```

#### StatefulLayout

```typescript
interface StatefulLayoutProps {}
```

**Features:**
- Toggles between paginated and scrolled layouts
- Handles scroll affordances automatically
- Visual indicators for layout modes
- Maintains state across reader sessions
- Accessibility support with ARIA labels

**Example:**
```typescript
<StatefulLayout />
```

#### StatefulZoom

```typescript
interface StatefulZoomProps {}
```

**Features:**
- Dual-mode control (slider or number field)
- Supports both font size and zoom scaling
- Configurable range and step values
- Percentage-based formatting
- Custom increment/decrement controls

**Example:**
```typescript
<StatefulZoom />
```

### Text Settings

#### StatefulTextGroup

```typescript
interface StatefulTextGroupProps {}
```

**Features:**
- Groups text-related settings components
- Plugin system integration
- Advanced settings panel support
- Preference persistence
- Customizable component ordering

**Example:**
```typescript
<StatefulTextGroup />
```

#### StatefulFontFamily

```typescript
interface StatefulFontFamilyProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Font family selection with preview
- Publisher defaults support
- Dropdown interface with visual preview

**Example:**
```typescript
<StatefulFontFamily />
```

#### StatefulFontWeight

```typescript
interface StatefulFontWeightProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Font weight control with slider
- Range validation (100-900)
- Publisher style integration
- Disabled state when using publisher fonts
- Real-time weight updates

**Example:**
```typescript
<StatefulFontWeight />
```

#### StatefulTextAlign

```typescript
interface StatefulTextAlignProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Text alignment options (start, justify, publisher)
- RTL support with automatic icon switching
- Hyphenation integration
- Visual alignment indicators
- Preference persistence

**Example:**
```typescript
<StatefulTextAlign />
```

#### StatefulHyphens

```typescript
interface StatefulHyphensProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Toggle hyphenation on/off
- Integration with text alignment
- Publisher style support
- Accessibility labels
- State persistence

**Example:**
```typescript
<StatefulHyphens />
```

#### StatefulTextNormalize

```typescript
interface StatefulTextNormalizeProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Text normalization toggle
- Integration with text processing
- State persistence
- Accessibility labels
- Real-time text updates

**Example:**
```typescript
<StatefulTextNormalize />
```

### Spacing Settings

#### StatefulSpacingGroup

```typescript
interface StatefulSpacingGroupProps {}
```

**Features:**
- Groups spacing-related settings components
- Plugin system integration
- Advanced settings panel support
- Preference persistence
- Customizable component ordering

**Example:**
```typescript
<StatefulSpacingGroup />
```

#### StatefulSpacingPresets

```typescript
interface StatefulSpacingPresetsProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Spacing presets toggle
- Integration with spacing settings
- State persistence
- Accessibility labels
- Real-time spacing updates

**Example:**
```typescript
<StatefulSpacingPresets />
```

#### StatefulLineHeight

```typescript
interface StatefulLineHeightProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Line height control (radio group)
- Publisher style integration

**Example:**
```typescript
<StatefulLineHeight />
```

#### StatefulLetterSpacing

```typescript
interface StatefulLetterSpacingProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Letter spacing control (slider/number field)
- Percentage-based adjustments
- Custom range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulLetterSpacing />
```

#### StatefulWordSpacing

```typescript
interface StatefulWordSpacingProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Word spacing control (slider/number field)
- Percentage-based adjustments
- Custom range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulWordSpacing />
```

#### StatefulParagraphSpacing

```typescript
interface StatefulParagraphSpacingProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Paragraph spacing control (slider/number field)
- Custom number formatting
- Range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulParagraphSpacing />
```

#### StatefulParagraphIndent

```typescript
interface StatefulParagraphIndentProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Paragraph indentation control (slider/number field)
- Custom number formatting
- Range and step configuration
- Publisher style integration
- Increment/decrement controls

**Example:**
```typescript
<StatefulParagraphIndent />
```

### Misc Settings

#### StatefulTheme

```typescript
interface StatefulThemeProps {
  mapArrowNav?: number;
}
```

**Features:**
- Theme selection with system integration
- Support for fixed-layout and reflowable EPUBs
- Auto theme based on system preferences
- RTL support
- Custom theme properties
- Real-time theme switching
- Accessibility support

**Example:**
```typescript
<StatefulTheme />
```

#### StatefulPublisherStyles

```typescript
interface StatefulPublisherStylesProps extends StatefulSettingsItemProps {
  standalone?: boolean;
}
```

**Features:**
- Toggle publisher default styles
- Manages multiple style properties:
  - Line height
  - Paragraph indent
  - Paragraph spacing
  - Letter spacing
  - Word spacing
- State persistence across sessions
- Real-time style updates

**Example:**
```typescript
<StatefulPublisherStyles />
```

## Common Features

All settings components share these characteristics:

- **Preference Integration**: Direct integration with the preferences system
- **EPUB Navigation**: Real-time updates to the EPUB reader
- **Redux State**: Centralized state management for applied settings
- **Accessibility**: ARIA attributes and keyboard navigation support
- **Styling**: Consistent styling through CSS modules