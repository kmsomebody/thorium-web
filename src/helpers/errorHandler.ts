// Simple, reliable error handling - no assumptions, no hardcoded mappings

export interface ProcessedError {
  // Original error - preserved exactly as received
  original: unknown;
  
  // Minimal, safe metadata that can be reliably extracted
  hasStatusCode: boolean;
  statusCode?: number;
  isError: boolean;
  errorName?: string;
  
  // Context
  context?: string;
  timestamp: number;
  
  // Helper methods for developers
  hasStatus(): boolean;
  getStatus(): number | undefined;
  isErrorInstance(): boolean;
  getErrorName(): string | undefined;
  
  // Error type helpers
  isNetwork(): boolean;
  isHttp(): boolean;
  isNotFound(): boolean;
  isAccessDenied(): boolean;
  isServerError(): boolean;
  isClientError(): boolean;
}

export class ErrorHandler {
  static process(error: unknown, context?: string): ProcessedError {
    const timestamp = Date.now();
    
    const processed = {
      original: error,
      hasStatusCode: this.hasStatusCode(error),
      statusCode: this.extractStatusCode(error),
      isError: error instanceof Error,
      errorName: error instanceof Error ? error.name : undefined,
      context,
      timestamp,
      
      hasStatus(): boolean {
        return this.hasStatusCode;
      },
      
      getStatus(): number | undefined {
        return this.statusCode;
      },
      
      isErrorInstance(): boolean {
        return this.isError;
      },
      
      getErrorName(): string | undefined {
        return this.errorName;
      },
      
      isNetwork(): boolean {
        return this.isError && this.errorName === "TypeError";
      },
      
      isHttp(): boolean {
        return this.hasStatusCode;
      },
      
      isNotFound(): boolean {
        return this.statusCode === 404;
      },
      
      isAccessDenied(): boolean {
        return this.statusCode === 403 || this.statusCode === 401;
      },
      
      isServerError(): boolean {
        return this.statusCode !== undefined && this.statusCode >= 500;
      },
      
      isClientError(): boolean {
        return this.statusCode !== undefined && this.statusCode >= 400 && this.statusCode < 500;
      }
    } as ProcessedError;
    
    return processed;
  }
  
  private static hasStatusCode(error: unknown): boolean {
    if (error instanceof Response) {
      return true;
    }
    
    if (typeof error === "object" && error !== null) {
      const errObj = error as any;
      return typeof errObj.status === "number" || typeof errObj.statusCode === "number";
    }
    
    return false;
  }
  
  private static extractStatusCode(error: unknown): number | undefined {
    if (error instanceof Response) {
      return error.status;
    }
    
    if (typeof error === "object" && error !== null) {
      const errObj = error as any;
      
      if (typeof errObj.status === "number") {
        return errObj.status;
      }
      
      if (typeof errObj.statusCode === "number") {
        return errObj.statusCode;
      }
    }
    
    return undefined;
  }
}
