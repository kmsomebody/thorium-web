"use client";

import { use, useEffect, useState } from "react";
import { StatefulLoader } from "@/components/Misc/StatefulLoader";
import { PUBLICATION_MANIFESTS } from "@/config/publications";
import { usePublication } from "@/hooks/usePublication";
import { useAppSelector } from "@/lib/hooks";
import { verifyManifestUrl } from "@/app/api/verify-manifest/verifyDomain";
import { StatefulReaderWrapper } from "@/components/Reader/StatefulReaderWrapper";

type Params = { identifier: string };

type Props = {
  params: Promise<Params>;
};

export default function BookPage({ params }: Props) {
  const [domainError, setDomainError] = useState<string | null>(null);
  const identifier = use(params).identifier;
  const isLoading = useAppSelector(state => state.reader.isLoading);
  
  // Check predefined publications, fallback to direct URL
  const manifestUrl = identifier 
    ? PUBLICATION_MANIFESTS[identifier as keyof typeof PUBLICATION_MANIFESTS] || 
      identifier
    : "";

  useEffect(() => {
    if (manifestUrl) {
      verifyManifestUrl(manifestUrl).then(allowed => {
        if (!allowed) {
          setDomainError(`Domain not allowed: ${ new URL(manifestUrl).hostname }`);
        }
      });
    }
  }, [manifestUrl]);

  const { 
    isLoading: publicationLoading, 
    error, 
    publication, 
    profile,
    localDataKey
  } = usePublication({
    url: manifestUrl,
    onError: (error) => {
      console.error("Publication loading error:", error);
    }
  });

  if (domainError) {
    return (
      <div className="container">
        <h1>Access Denied</h1>
        <p>{ domainError }</p>
      </div>
    );
  }

  return (
    <>
      { error ? (
        <div className="container">
          <h1>Error</h1>
          <p>{ error }</p>
        </div>
      ) : (
        <StatefulLoader isLoading={ isLoading || publicationLoading }>
          { publication && (
            <StatefulReaderWrapper 
              profile={ profile } 
              publication={ publication } 
              localDataKey={ localDataKey }
            />
          )}
        </StatefulLoader>
      )}
    </>
  );
}
