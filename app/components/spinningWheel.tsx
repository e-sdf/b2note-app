import * as React from "react";

export interface Props {
  show: boolean;
}

export default function SpinningWheel(props: Props): React.FunctionComponentElement<Props> {
  return (
    props.show ?
      <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    : <></>
  );
}
