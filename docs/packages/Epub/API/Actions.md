# Actions Components API Reference

This document details the Actions components that provide user interaction functionality in the EPUB reader.

## Action Bar Components

### StatefulCollapsibleActionsBar

A collapsible bar that contains action buttons with overflow handling.

**Props:**
- `id`: Unique identifier for the action bar
- `items`: Array of action items to display
- `prefs`: Preferences for action display and behavior
- `className`: Optional CSS class name
- `aria-label`: Accessibility label
- `overflowActionCallback`: Callback for overflow actions
- `overflowMenuDisplay`: Control overflow menu visibility

**Features:**
- Automatic overflow handling
- Collapsible/expandable interface
- Accessibility support

### StatefulOverflowMenu

A menu component that displays overflow actions.

**Props:**
- `id`: Unique identifier for the menu
- `items`: Array of overflow menu items
- `aria-label`: Accessibility label
- `className`: Optional CSS class name

**Features:**
- Keyboard navigation
- Screen reader support
- Custom styling options

## Action Types

### Fullscreen Action

#### StatefulFullscreenTrigger

Toggle component for fullscreen mode.

**Props:**
- `variant`: Visual variant of the trigger
- `className`: Optional CSS class name

**Features:**
- Toggle fullscreen mode
- Keyboard shortcut support
- Visual feedback

### Jump to Position Action

#### StatefulJumpToPositionTrigger

Navigation component for jumping to specific positions.

**Props:**
- `variant`: Visual variant of the trigger
- `className`: Optional CSS class name

**Features:**
- TBD

### Settings Action

#### StatefulVisualSettingsContainer

Container for reader settings controls.

**Props:**
- `triggerRef`: Reference to the trigger element

**Features:**
- Settings organization
- State persistence

#### StatefulSettingsTrigger

Trigger component for the settings panel.

**Props:**
- `variant`: Visual variant of the trigger
- `className`: Optional CSS class name

### Table of Contents Action

#### StatefulTocContainer

Container for the table of contents.

**Props:**
- `triggerRef`: Reference to the trigger element

**Features:**
- Hierarchical navigation
- Current position tracking
- Search functionality

#### StatefulTocTrigger

Trigger component for the table of contents.

**Props:**
- `variant`: Visual variant of the trigger
- `className`: Optional CSS class name

## Action Triggers

### StatefulActionIcon

Base component for action icons.

**Props:**
- `className`: Optional CSS class name
- `aria-label`: Accessibility label
- `placement`: Tooltip placement
- `tooltipLabel`: Tooltip text
- `onPress`: Press event handler
- `isDisabled`: Disable state
- `children`: Icon content

**Features:**
- Tooltip support
- Keyboard interaction
- Focus management

### StatefulOverflowMenuItem

Menu item component for overflow actions.

**Props:**
- `label`: Item label
- `SVGIcon`: Icon component
- `shortcut`: Keyboard shortcut
- `onAction`: Action handler
- `id`: Unique identifier
- `isDisabled`: Disable state

**Features:**
- Icon support
- Keyboard shortcuts
- Accessibility labels

### UnstableStatefulShortcut

Keyboard shortcut handling component.

TBD.

## Common Features

All action components share these features:

1. **State Management**
   - Redux integration
   - Persistent state
   - State synchronization
2. **Accessibility**
   - ARIA attributes
   - Keyboard navigation
   - Screen reader support
3. **Customization**
   - Theming support
4. **Event Handling**
   - Touch events
   - Mouse events
   - Keyboard events