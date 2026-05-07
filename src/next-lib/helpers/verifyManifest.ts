interface VerifyManifestOptions {
  /**
   * The URL of the manifest to verify
   */
  manifestUrl: string;
  
  /**
   * List of allowed domains (without protocol)
   * If empty or contains "*", all domains are allowed
   */
  allowedDomains?: string[];
  
  /**
   * Whether to allow all domains (overrides allowedDomains if true)
   * @default process.env.NODE_ENV !== "production"
   */
  allowAllDomains?: boolean;
}

interface VerifyManifestResult {
  /**
   * Whether the manifest URL is allowed
   */
  allowed: boolean;
  
  /**
   * The normalized manifest URL
   */
  url: string;
  
  /**
   * Error message if verification failed
   */
  error?: string;
}

/**
 * Verifies if a manifest URL is allowed based on domain restrictions
 * @param options Verification options
 * @returns Verification result
 */
export const verifyManifestUrl = (
  options: VerifyManifestOptions
): VerifyManifestResult => {
  const { manifestUrl, allowedDomains = [], allowAllDomains = process.env.NODE_ENV !== "production" } = options;
  
  if (!manifestUrl) {
    return {
      allowed: false,
      url: "",
      error: "URL is required"
    };
  }

  try {
    const url = new URL(manifestUrl);
    
    // In development or if no domains are specified, allow all
    const isAllowed = allowAllDomains || 
      allowedDomains.length === 0 ||
      allowedDomains.includes("*") ||
      allowedDomains.some(domain => {
        try {
          const domainUrl = domain.startsWith("http") 
            ? new URL(domain) 
            : new URL(`https://${ domain }`);
          return url.hostname === domainUrl.hostname;
        } catch {
          return false;
        }
      });
    
    if (!isAllowed) {
      return {
        allowed: false,
        url: manifestUrl,
        error: "Domain not allowed"
      };
    }
    
    return {
      allowed: true,
      url: manifestUrl
    };
    
  } catch (_error) {
    return {
      allowed: false,
      url: manifestUrl,
      error: "Invalid URL"
    };
  }
}

/**
 * Verifies a manifest URL from environment configuration
 * Uses MANIFEST_ALLOWED_DOMAINS environment variable for domain restrictions
 * @param manifestUrl The manifest URL to verify
 * @returns Verification result
 */
export const verifyManifestUrlFromEnv = (manifestUrl: string): VerifyManifestResult => {
  const allowedDomainsRaw = process.env.MANIFEST_ALLOWED_DOMAINS?.trim() || "";
  const allowedDomains = allowedDomainsRaw
    .split(",")
    .map(d => d.trim())
    .filter(Boolean);
    
  return verifyManifestUrl({
    manifestUrl,
    allowedDomains,
    allowAllDomains: process.env.NODE_ENV !== "production" || allowedDomains.length === 0
  });
}
