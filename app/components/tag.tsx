import * as React from "react";
import SpinningWheel from "app/components/spinningWheel";

export interface Props {
  tag: string;
  deletePmFn: (() => Promise<void>)|undefined;
  doneHandler(): void;
  errorHandler(err: string): void;
}

export default function Tag(props: Props): React.FunctionComponentElement<Props> {
  const [loading, setLoading] = React.useState(false);
  const deletePmFn = props.deletePmFn;

  return (
    loading ?
      <SpinningWheel show={true} />
    :
      <span className="badge badge-pill badge-light" style={{fontSize: "85%", marginLeft: 2, marginRight: 2}}>
        {props.tag}
        {deletePmFn ?
          <>
            <span> </span>
            <a href="#" 
              onClick={() => {
                if (deletePmFn) {
                  deletePmFn().then(
                    () => { setLoading(false); props.doneHandler(); },
                    err => { setLoading(false); props.errorHandler(err); }
                  );
                }
              }}>
              &times;
            </a>
          </>
        : <></>}
      </span>
  );
}
