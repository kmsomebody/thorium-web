"use client";

import { ReactNode } from "react";

import { HTMLAttributesWithRef } from "../customTypes";

export interface ThLoaderProps extends Omit<HTMLAttributesWithRef<HTMLDivElement>, "aria-busy" | "aria-live"> {
  ref?: React.ForwardedRef<HTMLDivElement>;
  isLoading: boolean;
  loader: ReactNode;
}

// Since we are removing loader entirely, no need for aria-hidden={ !isLoading }
// No need for a label either since we are using the string for the animation
export const ThLoader = ({ 
  ref, 
  isLoading,
  loader,
  children,
  ...props
 }: ThLoaderProps) => {
  return (
    <>
    <div
      ref={ ref }
      { ...props }
      style={{ position: "relative", ...props.style }}
      aria-busy={ isLoading }
      aria-live="polite"
    >
      { children }
      { isLoading && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10000 }}>
          { loader }
        </div>
      )}
    </div>
    </>
  )
}