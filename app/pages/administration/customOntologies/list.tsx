import * as React from "react";
import type { OntologyMeta } from "core/ontologyRegister";
import * as dApi from "app/api/domains";
import * as oApi from "app/api/ontologyRegister";
import * as userApi from "app/api/profile";
import { SysContext, AppContext } from "app/context";
import type { Domain } from "core/domainModel";
import Tag from "app/components/tag";
import { renderDeleteConfirmation } from "app/components/deleteConfirmation";
import DomainEditor from "./domainEditor";
import NameEditor from "../nameEditor";
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
  const [domains, setDomains] = React.useState([] as Array<Domain>);
  const [editedOntology, setEditedOntology] = React.useState(null as OntologyMeta|null);
  const [newDomain, setNewDomain] = React.useState(null as [string, string]|null);
  const [pendingDelete, setPendingDelete] = React.useState(null as OntologyMeta|null);

  const mbUser = props.appContext.mbUser;

  React.useEffect(
    () => { 
      dApi.getDomains().then(
        ds => setDomains(ds),
        err => props.errorHandler(err)
      );
    },
    []
  );

  React.useEffect(
    () => {
      if (mbUser) {
        userApi.getCustomOntologies(props.sysContext.config, mbUser.token, props.appContext.authErrAction)
        .then(setUserOntologies);
      }
    },
    [mbUser]
  );

  function getDomain(id: string): Domain|undefined {
    return domains.find(d => d.id === id);
  }

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

    function renderDomains(): React.ReactElement {
      return (
        <>
          {o.domainsIds?.map(
            did => {
              const mbDomain = getDomain(did);
              return (
                mbDomain ?
                  <Tag 
                    tag={mbDomain.name}
                    deletePmFn={
                      o.creatorId === mbUser?.profile.id ?
                        () => mbUser ? oApi.removeDomain(mbUser, o, mbDomain, props.appContext.authErrAction) : Promise.resolve()
                      : undefined
                     }
                    doneHandler={props.ontologyChangedHandler}
                    errorHandler={props.errorHandler}
                  />
                  : <></>
              );
            }
          )}
          {newDomain && newDomain[0] === o.id ?
            <DomainEditor
              appContext={props.appContext}
              options={domains.filter(d => !o.domainsIds?.includes(d.id))}
              updatePmFn={d => mbUser ? oApi.addDomain(mbUser, o, d, props.appContext.authErrAction) : Promise.resolve()}
              doneHandler={() => { setNewDomain(null); props.ontologyChangedHandler(); }}
              cancelledHandler={() => { setNewDomain(null); }}
              errorHandler={props.errorHandler}
            />
          : 
            o.creatorId === mbUser?.profile.id ?
              <a href="#" onClick={() => setNewDomain([o.id, "New domain"])}>
                <icons.AddIcon />
              </a>
            : <></>
          }
        </>
      );
    }

    function renderOntologyActions(): React.ReactElement {
      return (
        <div className="button-group d-flex flex-row">
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
            <>
              <button type="button" className="btn btn-sm btn-primary"
                data-toggle="tooltip" data-placement="bottom" title={o.name ? "Edit ontology name" : "Set ontology name"}
                onClick={() => setEditedOntology(o)}>
                <icons.EditIcon/>
              </button>
              <button type="button" className="btn btn-sm btn-danger"
                data-toggle="tooltip" data-placement="bottom" title="Delete ontology"
                onClick={() => setPendingDelete(o)}>
                <icons.DeleteIcon/>
              </button>
            </>
          : <></>
          }
        </div>
      );
    }

    const bgCol = isMyCustomOntology ? "#afa" : "#eee";

    return (
      <>
        <tr key={o.uri} className="mt-1 mb-1" style={{backgroundColor: bgCol}}>
          <td>
            {editedOntology === o ?
              <NameEditor
                appContext={props.appContext}
                name={o.name}
                updatePmFn={name => mbUser ? oApi.patchOntology(mbUser, { id: o.id, name}, props.appContext.authErrAction) : Promise.resolve()}
                doneHandler={() => { setEditedOntology(null); props.ontologyChangedHandler(); }}
                cancelledHandler={() => setEditedOntology(null)}
                errorHandler={props.errorHandler}
              />
            : 
              <>
                <a href={o.uri} target="_blank" rel="noreferrer"
                  data-toggle="tooltip" data-placement="bottom" title={o.uri}>
                  {o.name ? o.name : o.uri}
                </a>
                <div className="badge badge-info ml-2">{`${o.noOfTerms} terms`}</div>
              </>
            }
          </td>
          <td>
            {renderDomains()}
          </td>
          <td>{renderOntologyActions()}</td>
        </tr>
        {pendingDelete === o ?
          <tr className="mt-1 mb-1">
            <td colSpan={2} className="p-1" style={{backgroundColor: bgCol}}>
              {renderDeleteConfirmation(() => deleteOntology(o), () => setPendingDelete(null))}
            </td>
          </tr>
        : <></>}
      </>
    );
  }

  return (
    <table className="table mt-2 mb-2">
      <tr><th>Ontology name/URI</th><th>Domains</th><th></th></tr>
      {props.ontologies.map(renderOntologyRow)}
    </table>
  );
}
