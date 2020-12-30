import * as React from "react";
import { SysContext, AppContext } from "app/context";
import type { Domain } from "core/domainModel";
import * as api from "app/api/domains";
import { renderDeleteConfirmation } from "app/components/deleteConfirmation";
import NameEditor from "../nameEditor";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";
import * as icons from "app/components/icons";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function DomainsPanel(props: Props): React.FunctionComponentElement<Props> {
  const [domains, setDomains] = React.useState([] as Array<Domain>);
  const [newDomain, setNewDomain] = React.useState("");
  const [edited, setEdited] = React.useState(null as Domain|null);
  const [pendingDelete, setPendingDelete] = React.useState(null as Domain|null);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);

  const mbUser = props.appContext.mbUser;

  function loadDomains(): void {
    setLoading(true);
    api.getDomains().then(
      domains => { setDomains(domains); setLoading(false); },
      err => setErrorMessage(err)
    );
  }

  React.useEffect(() => loadDomains(), []);

  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  function addDomain(): void {
    if (mbUser) {
      setLoading(true);
      api.addDomain(newDomain, mbUser.token, props.appContext.authErrAction).then(
        () => {
          setLoading(false);
          setNewDomain("");
          loadDomains();
        },
        err => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  function deleteDomain(d: Domain): void {
    if (mbUser) {
      setLoading(true);
      api.deleteDomain(props.sysContext.config, d, mbUser.token, props.appContext.authErrAction).then(
        () => {
          setLoading(false);
          setPendingDelete(null);
          loadDomains();
        },
        err => { setLoading(false); setPendingDelete(null); setErrorMessage(err); }
      );
    }
  }

  function renderAddRow(): React.ReactElement {
    return (
      <tr>
        <td>
          <input type="text" className="form-control"
            value={newDomain}
            onKeyDown={ev => {
              if (ev.key === "Enter" && newDomain.length > 0) { addDomain(); }
            }}
            onChange={ev => setNewDomain(ev.target.value)}
          />
        </td>
        <td>
          <button type="button" className="btn btn-sm btn-primary"
            disabled={mbUser == null || newDomain.length === 0}
            onClick={() => addDomain()}>
            <icons.AddIcon/>
          </button>
        </td>
      </tr>
    );
  }

  function renderDomainRow(d: Domain): React.ReactElement {

    function renderActions(): React.ReactElement {
      return (
        d.creatorId === mbUser?.profile.id ?
          <>
            <button type="button" className="btn btn-sm btn-primary"
              data-toggle="tooltip" data-placement="bottom" title="Edit"
              onClick={() => setEdited(d)}>
              <icons.EditIcon />
            </button>
            <button type="button" className="btn btn-sm btn-danger"
              data-toggle="tooltip" data-placement="bottom" title="Delete"
              onClick={() => setPendingDelete(d)}>
              <icons.DeleteIcon />
            </button>
          </>
        : <></>
      );
    }

    return (
      <>
        <tr key={d.name} className="mt-1 mb-1">
          <td>
            {edited === d ?
              <NameEditor
                appContext={props.appContext}
                name={d.name}
                updatePmFn={name => mbUser ? api.patchDomain({ id: d.id, name }, mbUser.token, props.appContext.authErrAction) : Promise.resolve()}
                doneHandler={() => { setEdited(null); loadDomains(); }}
                cancelledHandler={() => setEdited(null)}
                errorHandler={setErrorMessage}
              />
            : d.name
            }
          </td>
          <td>{renderActions()}</td>
        </tr>
        {pendingDelete === d ?
          <tr className="mt-1 mb-1">
            <td colSpan={2} className="p-1">
              {renderDeleteConfirmation(() => deleteDomain(d), () => setPendingDelete(null))}
            </td>
          </tr>
        : <></>}
      </>
    );
  }

  return (
    <div className="container">
      <table className="table mt-2 mb-2">
        {domains.map(renderDomainRow)}
        {renderAddRow()}
      </table>
      <div className="d-flex flex-row justify-content-center mt-2">
        <SpinningWheel show={loading} />
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)} />
      </div>
    </div>
  );
}
