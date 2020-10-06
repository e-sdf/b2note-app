import _ from "lodash";
import {Ontology} from "core/ontologyRegister";
import * as React from "react";

interface Props {
  ontology: Ontology;
  closeHandler: () => void;
}

export default function DetailView(props: Props): React.FunctionComponentElement<Props> {
  const ontology = props.ontology;

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          {ontology.uri}
          <button type="button" className="ml-auto close"
            onClick={() => props.closeHandler()}>
            <span>&times;</span>
          </button>
        </div>
        <div className="card-body" style={{height: "calc(100vh - 270px)", overflowY: "scroll"}}>
          {ontology.terms.map(oTerm =>
            <div key={oTerm.labels} className="m-2">
              {oTerm.labels}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
