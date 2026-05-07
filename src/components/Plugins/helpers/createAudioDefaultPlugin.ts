import { ThPlugin } from "../PluginRegistry";
import { ThActionsKeys } from "@/preferences/models";
import { ThAudioKeys } from "@/preferences/models/audio";

import { StatefulSettingsTrigger } from "../../Actions/Settings/StatefulSettingsTrigger";
import { StatefulAudioSettingsContainer } from "../../Actions/Settings/StatefulAudioSettingsContainer";
import { StatefulTocTrigger } from "../../Actions/Toc/StatefulTocTrigger";
import { StatefulTocContainer } from "../../Actions/Toc/StatefulTocContainer";
import { StatefulJumpToPositionTrigger } from "../../Actions/JumpToPosition/StatefulJumpToPositionTrigger";
import { StatefulJumpToPositionContainer } from "../../Actions/JumpToPosition/StatefulJumpToPositionContainer";
import { StatefulFullscreenTrigger } from "../../Actions/Fullscreen/StatefulFullscreenTrigger";

import { StatefulAudioSkipBackwardInterval } from "../../Audio/Settings/StatefulAudioSkipBackwardInterval";
import { StatefulAudioSkipForwardInterval } from "../../Audio/Settings/StatefulAudioSkipForwardInterval";
import { StatefulAudioAutoPlay } from "../../Audio/Settings/StatefulAudioAutoPlay";
import { StatefulTheme } from "../../Settings/StatefulTheme";

export const createAudioDefaultPlugin = (): ThPlugin => {
  return {
    id: "audio-core",
    name: "Audio Core Components",
    description: "Default components for Thorium Web Audio StatefulReader",
    version: "1.0.0",
    components: {
      actions: {
        [ThActionsKeys.settings]: {
          Trigger: StatefulSettingsTrigger,
          Target: StatefulAudioSettingsContainer
        },
        [ThActionsKeys.toc]: {
          Trigger: StatefulTocTrigger,
          Target: StatefulTocContainer
        },
        [ThActionsKeys.jumpToPosition]: {
          Trigger: StatefulJumpToPositionTrigger,
          Target: StatefulJumpToPositionContainer
        },
        [ThActionsKeys.fullscreen]: {
          Trigger: StatefulFullscreenTrigger
        }
      },
      settings: {
        [ThAudioKeys.theme]: {
          Comp: StatefulTheme
        },
        [ThAudioKeys.skipBackwardInterval]: {
          Comp: StatefulAudioSkipBackwardInterval
        },
        [ThAudioKeys.skipForwardInterval]: {
          Comp: StatefulAudioSkipForwardInterval
        },
        [ThAudioKeys.autoPlay]: {
          Comp: StatefulAudioAutoPlay
        }
      }
    }
  };
};
