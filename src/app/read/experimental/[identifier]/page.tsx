"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StatefulLoader } from "@/components/Misc/StatefulLoader";
import { usePublication } from "@/hooks/usePublication";
import { useAppSelector } from "@/lib/hooks";
import { verifyManifestUrl } from "@/app/api/verify-manifest/verifyDomain";

const WEB_MANIFESTS = {
  "readium-css": "https://readium.org/css/docs/manifest.json",
  "moby-dick": "https://readium.org/webpub-manifest/examples/MobyDick/manifest.json",
  "molly-hopper": "https://publication-server.readium.org/webpub/Z3M6Ly9yZWFkaXVtLXBsYXlncm91bmQtZmlsZXMvZGVtby9tb2xseS1ob3BwZXItdjEuMS53ZWJwdWI/manifest.json"
}

const ExperimentalWebPubStatefulReader = dynamic(() => import("@/components/WebPub").then(mod => ({ default: mod.ExperimentalWebPubStatefulReader })), {
  ssr: false
});

type Params = { identifier: string };

type Props = {
  params: Promise<Params>;
};

export default function WebPubPage({ params }: Props) {
  const [domainError, setDomainError] = useState<string | null>(null);
  const identifier = use(params).identifier;
  const isLoading = useAppSelector(state => state.reader.isLoading);
  
  // Determine manifest URL - either from predefined list or treat identifier as URL
  const manifestUrl = identifier ? WEB_MANIFESTS[identifier as keyof typeof WEB_MANIFESTS] || identifier : "";

  useEffect(() => {
    if (manifestUrl) {
      verifyManifestUrl(manifestUrl).then(allowed => {
        if (!allowed) {
          setDomainError(`Domain not allowed: ${ new URL(manifestUrl).hostname }`);
        }
      });
    }
  }, [manifestUrl]);

  const { error, manifest, selfLink } = usePublication({
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
        <StatefulLoader isLoading={ isLoading }>
          { manifest && selfLink && <ExperimentalWebPubStatefulReader rawManifest={ manifest } selfHref={ selfLink } /> }
        </StatefulLoader>
      )}
    </>
  );
}