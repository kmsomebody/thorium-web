"use client";

import { ReactNode } from "react";

import { ThDockingKeys, ThSheetTypes } from "@/preferences/models";

import { ThTypedComponentRenderer } from "@/core/Components/Containers/ThTypedComponentRenderer";
import { StatefulPopoverSheet, StatefulPopoverSheetProps } from "./StatefulPopoverSheet";
import { StatefulBottomSheet, StatefulBottomSheetProps } from "./StatefulBottomSheet";
import { StatefulFullScreenSheet, StatefulFullScreenSheetProps } from "./StatefulFullScreenSheet";
import { StatefulDockedSheet, StatefulDockedSheetProps } from "./StatefulDockedSheet";

const componentMap = {
  [ThSheetTypes.popover]: StatefulPopoverSheet,
  [ThSheetTypes.bottomSheet]: StatefulBottomSheet,
  [ThSheetTypes.fullscreen]: StatefulFullScreenSheet,
  [ThSheetTypes.dockedStart]: (props: StatefulDockedSheetProps) => <StatefulDockedSheet { ...props } flow={ ThDockingKeys.start } />,
  [ThSheetTypes.dockedEnd]: (props: StatefulDockedSheetProps) => <StatefulDockedSheet { ...props } flow={ ThDockingKeys.end } />
};

export const StatefulSheetWrapper = ({
  sheetType,
  sheetProps,
  children
}: {
  sheetType: ThSheetTypes,
  sheetProps: StatefulPopoverSheetProps | StatefulFullScreenSheetProps | StatefulDockedSheetProps | StatefulBottomSheetProps,
  children: ReactNode
}) => {

  return (
    <ThTypedComponentRenderer
      type={ sheetType }
      componentMap={ componentMap }
      props={ sheetProps }
    >
      { children }
    </ThTypedComponentRenderer>
  );
}