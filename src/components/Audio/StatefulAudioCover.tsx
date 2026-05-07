import styles from "./assets/styles/thorium-web.audioCover.module.css";

import MusicNoteIcon from "./assets/icons/music_note.svg";
import { proxyUrl } from "@/helpers/proxyUrl";
import { useI18n } from "@/i18n/useI18n";

interface StatefulAudioCoverProps {
  coverUrl?: string;
  title?: string;
}

export function StatefulAudioCover({ coverUrl, title }: StatefulAudioCoverProps) {
  const { t } = useI18n();

  return (
    <figure className={ styles.audioCoverSection }>
      { coverUrl ? (
        <img
          src={ proxyUrl(coverUrl) }
          alt={ title || t("audio.player.coverAlt") }
          className={ styles.audioCoverImage }
          crossOrigin="anonymous"
        />
      ) : (
        <div className={ styles.audioCoverPlaceholder }>
          <MusicNoteIcon />
        </div>
      ) }
    </figure>
  );
}
