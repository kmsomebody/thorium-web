import { Locator } from "@readium/shared";
import dynamic from "next/dynamic";

const StatefulEpubReader = dynamic(() => import("@/components/Epub").then(mod => ({ default: mod.StatefulReader })), {
  ssr: false
});

const StatefulWebPubReader = dynamic(() => import("@/components/WebPub").then(mod => ({ default: mod.ExperimentalWebPubStatefulReader })), {
  ssr: false
});

interface ReaderComponentProps {
  profile: "epub" | "webPub" | "audio" | undefined | null;
  publication: any;
  localDataKey: string | null;
  initialPosition?: Locator | null;
}

export const ReaderComponent = ({ profile, ...props }: ReaderComponentProps) => {
  switch (profile) {
    case "epub":
      return <StatefulEpubReader { ...props } />;
    case "audio":
      // TODO: Implement audio reader when available
      return <div className="container"><h1>Audio Reader Coming Soon</h1></div>;
    case "webPub":
    default:
      return <StatefulWebPubReader { ...props } />;
  }
};
