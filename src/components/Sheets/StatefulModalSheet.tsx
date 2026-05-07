"use client";

import { StatefulSheet } from "./models/sheets";
import { StatefulModalBase } from "./StatefulModalBase";

import sheetStyles from "./assets/styles/thorium-web.sheets.module.css";

export interface StatefulModalSheetProps extends StatefulSheet {};

export const StatefulModalSheet = (props: StatefulModalSheetProps) => {
  return (
    <StatefulModalBase
      { ...props }
      sheetClassName={ sheetStyles.modal }
      dialogClassName={ sheetStyles.modalDialog }
    />
  )
}
