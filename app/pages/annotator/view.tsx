import * as React from "react";
import type { SysContext, AppContext } from "app/context";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function AnnotatorPage(props: Props): React.FunctionComponentElement<Props> {
  return (
    <div className="container-fluid">
      <img src="https://marcellusdrilling.com/wp-content/uploads/2016/10/under-construction.png"/>
    </div>
  );
}
