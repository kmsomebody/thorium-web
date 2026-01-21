const PREFIXES = {
  short: "th",
  full: "thorium_web"
} as const;

type PrefixVariant = keyof typeof PREFIXES;

export const prefixString = (str: string, variant: PrefixVariant = "short") => {
  return `${ PREFIXES[variant] }-${ str }`;
}