import * as React from "react";
import type { OntologyMeta } from "core/ontologyRegister";
import * as oApi from "app/api/ontologyRegister";
import * as userApi from "app/api/profile";
import { SysContext, AppContext } from "app/context";
import { renderDeleteConfirmation } from "app/components/deleteConfirmation";
import * as icons from "app/components/icons";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  ontologies: Array<OntologyMeta>;
  errorHandler: (err: string) => void;
  loadingHandler: (loading: boolean) => void;
  ontologyChangedHandler: () => void;
  profileChangedHandler: () => void;
  detailRequestHandler: (ontology: OntologyMeta) => void;
}

export default function OntologiesList(props: Props): React.FunctionComponentElement<Props> {
  const [userOntologies, setUserOntologies] = React.useState([] as Array<OntologyMeta>);
  const [pendingDelete, setPendingDelete] = React.useState(null as OntologyMeta|null);

  const mbUser = props.appContext.mbUser;

  React.useEffect(
    () => {
      if (mbUser) {
        userApi.getCustomOntologies(props.sysContext.config, mbUser.token, props.appContext.authErrAction)
        .then(setUserOntologies);
      }
    },
    [mbUser]
  );

  function addOntologyToProfile(o: OntologyMeta): void {
    if (mbUser) {
      props.loadingHandler(true);
      userApi.addCustomOntology(props.sysContext.config, o, mbUser.token, props.appContext.authErrAction).then(
        () => {
          props.loadingHandler(false);
          props.profileChangedHandler();
        },
        err => {props.loadingHandler(false); props.errorHandler(err); }
      );
    }
  }

  function removeOntologyFromProfile(o: OntologyMeta): void {
    if (mbUser) {
      props.loadingHandler(true);
      userApi.removeCustomOntology(props.sysContext.config, o, mbUser.token, props.appContext.authErrAction).then(
        () => {
          props.loadingHandler(false);
          props.profileChangedHandler();
        },
        err => {props.loadingHandler(false); props.errorHandler(err); }
      );
    }
  }

  function deleteOntology(o: OntologyMeta): void {
    if (mbUser) {
      props.loadingHandler(true);
      oApi.deleteOntology(mbUser, o, props.appContext.authErrAction).then(
        () => {
          props.loadingHandler(false);
          setPendingDelete(null);
          props.ontologyChangedHandler();
        },
        err => { props.loadingHandler(false); setPendingDelete(null); props.errorHandler(err); }
      );
    }
  }

  function renderOntologyRow(o: OntologyMeta): React.ReactElement {
    const isMyCustomOntology = userOntologies.some(o1 => o1.id === o.id);

    function renderOntologyActions(): React.ReactElement {
      return (
        <div className="button-group">
          <button type="button" className="btn btn-sm btn-info"
            data-toggle="tooltip" data-placement="bottom" title="Show ontology details"
            onClick={() => props.detailRequestHandler(o)}>
            <icons.InfoIcon/>
          </button>
          {isMyCustomOntology ?
            <button type="button" className="btn btn-sm btn-warning"
              data-toggle="tooltip" data-placement="bottom" title="Remove from my ontologies"
              onClick={() => removeOntologyFromProfile(o)}>
              <icons.RemoveIcon/>
            </button>
          :
            <button type="button" className="btn btn-sm btn-primary"
              data-toggle="tooltip" data-placement="bottom" title="Add to my ontologies"
              onClick={() => addOntologyToProfile(o)}>
              <icons.AddIcon/>
            </button>
          }
          {o.creatorId === mbUser?.profile.id ?
            <button type="button" className="btn btn-sm btn-danger"
              onClick={() => setPendingDelete(o)}>
              <icons.DeleteIcon/>
            </button>
          : <></>
          }
        </div>
      );
    }

    const bgCol = isMyCustomOntology ? "#afa" : "#eee";

              // <div className="badge badge-info ml-2">{`${o.terms.length} terms`}</div>
    return (
      <tr key={o.uri} className="mt-1 mb-1" style={{backgroundColor: bgCol}}>
        {pendingDelete === o ?
          renderDeleteConfirmation(() => deleteOntology(o), () => setPendingDelete(null))
        :
          <>
            <td>
              <a href={o.uri} target="_blank" rel="noreferrer">{o.uri}</a>
              <div className="badge badge-info ml-2">{`${o.noOfTerms} terms`}</div>
            </td>
            <td>{renderOntologyActions()}</td>
          </>
        }
      </tr>
    );
  }

  return (
    <table className="table mt-2 mb-2">
      {props.ontologies.map(o => renderOntologyRow(o))}
    </table>
  );
}
