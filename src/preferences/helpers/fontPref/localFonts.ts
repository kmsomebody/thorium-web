import { FontDefinition, FontSpec, LocalStaticFontFile, LocalStaticFontSource } from "@/preferences/models";

interface CreateFontDefinitionParams {
  id: string;
  name: string;
  files: LocalStaticFontFile[];
  family?: string;
  label?: string;
  fallbacks?: string[];
}

/**
 * Creates a complete font definition by inferring properties from static font files
 * @param params Font definition parameters
 * @returns Complete font definition with inferred spec
 * @throws Error if files are not static font files or if no files provided
 */
export const createDefinitionFromStaticFonts = (
  params: CreateFontDefinitionParams
): FontDefinition => {
  const { id, name, files, family, label, fallbacks = ["sans-serif"] } = params;
  
  if (!files || files.length === 0) {
    throw new Error("No files provided to infer font specification");
  }

  // Verify all files have weights (static fonts only)
  if (!files.every(file => file.weight !== undefined)) {
    throw new Error("All files must have explicit weights for static font specification inference");
  }

  const weights = Array.from(new Set(files.map(file => file.weight))).sort((a, b) => a - b);
  const styles = Array.from(new Set(files.map(file => file.style)));
  
  const source: LocalStaticFontSource = {
    type: "custom",
    provider: "local",
    variant: "static",
    files
  };
  
  const spec: FontSpec = {
    family: family || name,
    fallbacks,
    weights: {
      type: "static",
      values: weights
    },
    styles: styles
  };
  
  return {
    id,
    name,
    ...(label && { label }),
    source,
    spec
  };
}