import styles from "./assets/styles/thorium-web.audioCover.module.css";

import MusicNoteIcon from "./assets/icons/music_note.svg";
import SyncIcon from "./assets/icons/sync.svg";

import { useI18n } from "@/i18n/useI18n";

import { useAppSelector } from "@/lib/hooks";

import { proxyUrl } from "@/helpers/proxyUrl";

interface StatefulAudioCoverProps {
  coverUrl?: string;
  title?: string;
}

export function StatefulAudioCover({ coverUrl, title }: StatefulAudioCoverProps) {
  const { t } = useI18n();
  const isTrackReady = useAppSelector(state => state.player.isTrackReady);
  const isStalled = useAppSelector(state => state.player.isStalled);

  const showSyncOverlay = !isTrackReady || isStalled;

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
          { showSyncOverlay ? (
            <SyncIcon className={ styles.audioCoverSyncIcon } aria-hidden="true" />
          ) : (
            <MusicNoteIcon />
          ) }
        </div>
      ) }
      { coverUrl && showSyncOverlay && (
        <div className={ styles.audioCoverSyncOverlay } aria-hidden="true">
          <SyncIcon className={ styles.audioCoverSyncIcon } />
        </div>
      ) }
    </figure>
  );
}
