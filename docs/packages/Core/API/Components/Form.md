# Form Components API Documentation

## ThForm

### Props

```typescript
interface ThFormProps extends FormProps {
  ref?: React.ForwardedRef<HTMLFormElement>;
  label: string;                      // Submit button text
  compounds?: {
    button?: Exclude<ButtonProps, "type"> | React.ReactElement<ButtonProps>; // Custom submit button
  }
}
```

### Features
- Form submission handling
- Compound component pattern
- Custom submit button support
- Accessibility-first design

## ThFormTextField

### Props

```typescript
interface ThFormTextFieldProps extends TextFieldProps {
  ref?: React.ForwardedRef<HTMLInputElement>;
  label?: string;                      // Field label text
  compounds?: {
    label?: LabelProps;               // Props for label component
    input?: InputProps;               // Props for input component
    description?: string;             // Help text description
    fieldError?: FieldErrorProps;     // Props for error message
  },
  errorMessage?: string | ((validation: ValidationResult) => string); // Error message or generator
}
```

### Features
- Text input with validation
- Customizable label and input styling
- Error message handling
- Help text support

## ThFormNumberField

### Props

```typescript
interface ThFormNumberFieldProps extends NumberFieldProps {
  ref?: React.ForwardedRef<HTMLInputElement>;
  label?: string;                      // Field label text
  compounds?: {
    label?: LabelProps;               // Props for label component
    input?: InputProps;               // Props for input component
    description?: string;             // Help text description
  }
}
```

### Features
- Numeric input with validation
- Type-safe number handling
- Customizable label and input styling
- Help text support

## ThFormSearchField

### Props

```typescript
interface ThFormSearchFieldProps extends SearchFieldProps {
  ref?: React.ForwardedRef<HTMLInputElement>;
  label?: string;                      // Field label text
  compounds?: {
    label?: LabelProps;
    input?: InputProps;
    searchIcon?: HTMLAttributes<HTMLDivElement> | React.ReactElement<HTMLDivElement>;
    clearButton?: ThActionButtonProps | React.ReactElement<ThActionButtonProps>;
    description?: string;
    fieldError?: FieldErrorProps;
  },
  errorMessage?: string | ((validation: ValidationResult) => string);
}
```

### Features
- Search input with validation
- Customizable label, input, icon and button styling
- Help text support