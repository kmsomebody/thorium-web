import styles from "./assets/styles/thorium-web.audioMetadata.module.css";

import { Publication } from "@readium/shared";

interface StatefulAudioMetadataProps {
  publication: Publication;
}

export function StatefulAudioMetadata({ publication }: StatefulAudioMetadataProps) {
  const { metadata } = publication;

  const title = metadata.title.getTranslation("en");
  const subtitle = metadata.subtitle?.getTranslation("en");
  const authors = metadata.authors?.items.map(a => a.name.getTranslation("en"));

  return (
    <header className={ styles.audioMetadata }>
      <h1 className={ styles.audioMetadataTitle }>{ title }
        { subtitle && <span className={ styles.audioMetadataSubtitle }>{ subtitle }</span> }
      </h1>
      { authors && authors.length > 0 && (
        <div className={ styles.audioMetadataAuthors }>{ authors.join(", ") }</div>
      ) }
    </header>
  );
}
