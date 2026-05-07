# Collapsibility and Visibility

The concept of collapsibility applies to Action Triggers e.g. Settings, Fullscreen and ToC actions in the top end corner, or docking options in sheets/containers.

It is relying on a global `collapse` property, and a specific `visibility` property for each of these actions.

## Collapsibility

When using collapsibility, you can configure how actions should be rendered i.e. as an action icon, or a menu item in an overflow menu.

The `collapse` value can be:

- `false` to disable collapsibility entirely – in this case the overflow menu won't be used;
- `true` to enable space-fit mode – items migrate between the bar and the overflow menu based on the available container width at runtime;
- an object whose properties are in enum `ThBreakpoints` and values can be:
  - the `number` of icons to ideally display, constrained by the actions' `visibility`;
  - keyword `all` as an alias for the total number of actions – in this case the overflow menu won't be used.

### Space-fit mode (`collapse: true`)

When set to `true`, the bar measures its available width at runtime and fits as many `partially` items as possible before migrating the rest to the overflow menu. The layout updates automatically on resize and when icon sizes change (e.g. due to app-level zoom).

The minimum bar width is always the sum of `always` items, plus the overflow menu trigger when at least one item has been pushed to the menu. Items with `visibility: overflow` never appear in the bar and are not counted.

```
actions: {
  ...
  collapse: true
}
```

### Breakpoint mode (`collapse: Record`)

In breakpoint mode the active breakpoint is resolved from the **reader container's width** (not the viewport), so the bar adapts to the space available to the reader even when it is embedded in a smaller layout. See [Theming — Window breakpoint vs. container breakpoint](./Theming.md#window-breakpoint-vs-container-breakpoint) for details.

In the following example, the collapsibility logic will try to display 2 action icons on the smaller breakpoints, including the overflow menu icon.

```
actions: {
  ...
  collapse: {
    [ThBreakpoints.compact]: 2,
    [ThBreakpoints.medium]: 2
  }
}
```

Note this object does not require all `ThBreakpoints` to be configured, only the ones requiring a specific setting.

The visibility set for actions has priority though. An action whose `visibility` is set to `always` can't be collapsed. This means that, in the example above, if two actions are set to `always`, then `collapse` can't display only 2 action icons.

## Visibility

Each action sets its own `visibility` via the `ThCollapsibilityVisibility` enum:

- `always`: the action is always displayed as an action icon and never migrates to the overflow menu;
- `partially`: the action is displayed as an action icon or a menu item depending on the `collapse` configuration and available space;
- `overflow`: the action is always displayed as a menu item, regardless of available space.

For instance:

```
[ActionKeys.fullscreen]: {
  ...
  visibility: ThCollapsibilityVisibility.partially
}
```

This means the Fullscreen action trigger will be migrated into the overflow menu depending on your `collapse` configuration.

```
[ActionKeys.jumpToPosition]: {
  ...
  visibility: ThCollapsibilityVisibility.overflow
}
```

This means the Jump To Position action trigger will always be displayed as an overflow menu item.
