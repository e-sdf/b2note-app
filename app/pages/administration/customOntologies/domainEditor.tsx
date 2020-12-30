import * as React from "react";
import { Typeahead } from "react-bootstrap-typeahead";
import type { AppContext } from "app/context";
import type { Domain } from "core/domainModel";
import SpinningWheel from "app/components/spinningWheel";
import * as icons from "app/components/icons";

export interface Props {
  appContext: AppContext;
  options: Array<Domain>;
  updatePmFn(domain: Domain): Promise<any>;
  doneHandler(): void;
  cancelledHandler(): void;
  errorHandler(err: string): void;
}

export default function NameEditor(props: Props): React.FunctionComponentElement<Props> {
  const [domain, setDomain] = React.useState(null as null|Domain);
  const [loading, setLoading] = React.useState(false);
  const mbUser = props.appContext.mbUser;

  function updateDomain(): void {
    if (mbUser && domain) {
      setLoading(true);
      props.updatePmFn(domain).then(
        () => { setLoading(false); props.doneHandler(); },
        err => { setLoading(false); props.errorHandler(err); }
      );
    }
  }

  function renderInput(): React.ReactElement {
    return (
      <Typeahead
        onChange={selected => { if (selected.length > 0) { setDomain(selected[0]); }}}
        options={props.options}
        labelKey="name"
        onKeyDown={ev => {if (domain && (ev as KeyboardEvent).code === "Enter") { updateDomain(); }}}
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
            disabled={domain === null}
            onClick={updateDomain}>
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