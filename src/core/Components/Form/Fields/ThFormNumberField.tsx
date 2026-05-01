"use client";

import { WithRef } from "../../customTypes";

import { 
  FieldError, 
  FieldErrorProps, 
  Input, 
  InputProps, 
  Label, 
  LabelProps, 
  NumberField, 
  NumberFieldProps, 
  Text 
} from "react-aria-components";

export interface ThFormNumberFieldProps extends NumberFieldProps {
  ref?: React.ForwardedRef<HTMLInputElement>;
  label?: string;
  compounds?: {
    label?: WithRef<LabelProps, HTMLLabelElement>;
    input?: WithRef<InputProps, HTMLInputElement>;
    description?: string;
    fieldError?: WithRef<FieldErrorProps, HTMLDivElement>;
  },
  errorMessage?: string;
}

export const ThFormNumberField = ({
  ref,
  label,
  compounds,
  children,
  errorMessage,
  ...props
}: ThFormNumberFieldProps) => {
  return(
    <>
    <NumberField
      ref={ ref }
      {...props }
    >
      { children 
        ? children 
        : <>
          { label && <Label {...compounds?.label }>
              { label }
            </Label>
          }
          
          { errorMessage && <FieldError { ...compounds?.fieldError }>
              { errorMessage }
            </FieldError> 
          }
          
          <Input {...compounds?.input } />
          
          { compounds?.description && <Text slot="description"> 
              { compounds?.description } 
            </Text> 
          }
          </> 
      }
    </NumberField>
    </>
  )
}