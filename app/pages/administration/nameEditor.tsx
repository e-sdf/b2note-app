import * as React from "react";
import type { AppContext } from "app/context";
import SpinningWheel from "app/components/spinningWheel";
import * as icons from "app/components/icons";

export interface Props {
  appContext: AppContext;
  name?: string|undefined;
  updatePmFn(name: string): Promise<any>;
  doneHandler(): void;
  cancelledHandler(): void;
  errorHandler(err: string): void;
}

export default function NameEditor(props: Props): React.FunctionComponentElement<Props> {
  const [name, setName] = React.useState(props.name || "New name");
  const [loading, setLoading] = React.useState(false);
  const mbUser = props.appContext.mbUser;

  function updateName(): void {
    if (mbUser) {
      setLoading(true);
      props.updatePmFn(name).then(
        () => { setLoading(false); props.doneHandler(); },
        err => { setLoading(false); props.errorHandler(err); }
      );
    }
  }

  function renderInput(): React.ReactElement {
    return (
      <input type="text" className="form-control"
        ref={inputElement => { if (inputElement) { inputElement.focus(); }}}
        value={name}
        onKeyDown={ev => {
          if (ev.key === "Enter" && mbUser) { updateName(); }
        }}
        onFocus={e => e.currentTarget.select()}
        onChange={ev => setName(ev.target.value)}
      />
    );
  }

  function renderActionButtons(): React.ReactElement {
    return (
      <div className="btn-group">
        {loading ?
          <SpinningWheel show={true}/>
        :
          <button type="button" className="btn btn-sm btn-primary"
            disabled={name.length === 0}
            onClick={updateName}>
            <icons.SaveIcon/>
          </button>
        }
        <button type="button" className="btn btn-sm btn-warning"
          onClick={() => props.cancelledHandler()}>
          <icons.CancelIcon/>
        </button>
      </div>
    );
}

  return (
    <div className="d-flex flex-row">
      {renderInput()}
      {renderActionButtons()}
    </div>
  );
}