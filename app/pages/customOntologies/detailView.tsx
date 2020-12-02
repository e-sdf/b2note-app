import * as React from "react";
import { AppContext } from "app/context";
import { OntologyMeta, Ontology } from "core/ontologyRegister";
import * as oApi from "app/api/ontologyRegister";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";

interface Props {
  appContext: AppContext;
  ontologyMeta: OntologyMeta;
  closeHandler: () => void;
}

export default function DetailView(props: Props): React.FunctionComponentElement<Props> {
  const [ontology, setOntology] = React.useState(null as Ontology|null);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const mbUser = props.appContext.mbUser;
  const authErrAction = props.appContext.authErrAction;

  React.useEffect(
    () => {
      if (mbUser) {
        setLoading(true);
        oApi.getOntology(mbUser, props.ontologyMeta.id, authErrAction).then(
          o => {
            setOntology(o);
            setLoading(false);
          },
          err => {
            setLoading(false);
            setErrorMessage(err);
          }
        );
      }
    },
    [mbUser, props.ontologyMeta]
  );
  
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          {props.ontologyMeta.name ? <span>{props.ontologyMeta.name} </span> : <></>}
          {"<"}<a href={props.ontologyMeta.uri}>{props.ontologyMeta.uri}</a>{">"}
          <button type="button" className="ml-auto close"
            onClick={() => props.closeHandler()}>
            <span>&times;</span>
          </button>
        </div>
        {ontology ?
          <div className="card-body" style={{height: "calc(100vh - 270px)", overflowY: "scroll"}}>
            <table className="table table-striped">
              <thead>
                <tr><th>Label</th><th>Description</th></tr>
              </thead>
              <tbody>
                {ontology.terms.map(oTerm =>
                  <tr key={oTerm.label}>
                    <td>{oTerm.label}</td>
                    <td>{oTerm.description}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="d-flex flex-row justify-content-center mt-2">
              <SpinningWheel show={loading}/>
              <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
            </div>
          </div>
        : <></>}
      </div>
    </div>
  );
}
