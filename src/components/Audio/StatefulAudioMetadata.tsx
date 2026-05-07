import styles from "./assets/styles/thorium-web.audioMetadata.module.css";

import { Publication } from "@readium/shared";
import { useAudioPreferences } from "@/preferences/hooks/useAudioPreferences";
import { ThAudioPublicationMetadataComponent } from "@/preferences/models";

interface StatefulAudioMetadataProps {
  publication: Publication;
}

export function StatefulAudioMetadata({ publication }: StatefulAudioMetadataProps) {
  const { preferences } = useAudioPreferences();
  const { metadata } = publication;

  const title = metadata.title.getTranslation("en");
  const subtitle = metadata.subtitle?.getTranslation("en");
  const authors = metadata.authors?.items.map(a => a.name.getTranslation("en"));

  const metadataOrder = preferences.theming.layout.publicationMetadata.order;

  const renderMetadataComponents = () => {
    return metadataOrder.map((component: ThAudioPublicationMetadataComponent) => {
      switch (component) {
        case ThAudioPublicationMetadataComponent.title:
          return <h1 key="title" className={ styles.audioMetadataTitle }>{ title }</h1>;

        case ThAudioPublicationMetadataComponent.titleWithSubtitle:
          return (
            <hgroup key="title-with-subtitle">
              <h1 className={ styles.audioMetadataTitle }>{ title }</h1>
              { subtitle && <p className={ styles.audioMetadataSubtitle }>{ subtitle }</p> }
            </hgroup>
          );

        case ThAudioPublicationMetadataComponent.subtitleWithTitle:
          return (
            <hgroup key="subtitle-with-title">
              { subtitle && <p className={ styles.audioMetadataSubtitle }>{ subtitle }</p> }
              <h1 className={ styles.audioMetadataTitle }>{ title }</h1>
            </hgroup>
          );

        case ThAudioPublicationMetadataComponent.authors:
          return authors && authors.length > 0 ? (
            <p key="authors" className={ styles.audioMetadataAuthors }>{ authors.join(", ") }</p>
          ) : null;
          
        default:
          return null;
      }
    }).filter(Boolean);
  };

  return (
    <header className={ styles.audioMetadata }>
      { renderMetadataComponents() }
    </header>
  );
}
