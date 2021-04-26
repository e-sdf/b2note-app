import _ from "lodash";
import * as React from "react";
import { SysContext, AppContext } from "app/context";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function CockpitPage(props: Props): React.FunctionComponentElement<Props> {
  return (
    <div>Cockpit</div>
  );
}