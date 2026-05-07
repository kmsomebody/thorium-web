"use client";

import { useNumberFormatter } from "react-aria";

import { StatefulRadioGroup, StatefulRadioGroupProps } from "./StatefulRadioGroup";

export interface StatefulPresetsGroupProps extends Omit<StatefulRadioGroupProps, "items" | "value" | "onChange"> {
  presets: number[];
  value?: number;
  formatOptions?: Intl.NumberFormatOptions;
  formatValue?: (value: number) => string;
  onChange?: (value: number) => void;
}

export const StatefulPresetsGroup = ({
  presets,
  value,
  formatOptions,
  formatValue,
  onChange,
  ...props
}: StatefulPresetsGroupProps) => {
  const numberFormatter = useNumberFormatter(formatOptions);
  const resolvedFormatValue = formatValue ?? (formatOptions ? (v: number) => numberFormatter.format(v) : String);

  const items = presets.map((p) => ({
    id: String(p),
    value: String(p),
    label: resolvedFormatValue(p),
  }));

  const radioValue = value !== undefined && presets.includes(value) ? String(value) : "";

  const handleChange = (v: string) => {
    onChange?.(parseFloat(v));
  };

  return (
    <StatefulRadioGroup
      { ...props }
      items={ items }
      value={ radioValue }
      onChange={ handleChange }
    />
  );
};
