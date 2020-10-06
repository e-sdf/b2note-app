import * as React from "react";
import * as icons from "./icons";
import type { ApiComponent } from "./defs";
import * as anModel from "core/annotationsModel";
import * as anApi from "../api/annotations";
import { AnBodyTagEditor  } from "./tagEditor";
import SpinningWheel from "../components/spinningWheel";
import Alert from "./alert";

interface Props extends ApiComponent {
  annotation: anModel.Annotation;
  anChangedHandler?: (newAn: anModel.Annotation) => void;
}

export default function AnTagView(props: Props): React.FunctionComponentElement<Props> {
  const [edited, setEdited] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const annotation = props.annotation;
  const mbUser = props.context.mbUser;

  function updateAn(newBody: anModel.AnBody): void {
    if (mbUser) {
      setLoading(true);
      anApi.patchAnnotationBody(mbUser, props.annotation.id, newBody, props.authErrAction).then(
        (newAn) => {
          setLoading(false);
          if (props.anChangedHandler) { props.anChangedHandler(newAn); }
        },
        (err) => { setLoading(false); setErrorMessage(err); }
      );
    }
  }

  return (
    <>
      {edited ?
        <div style={{marginLeft: "5px"}}>
          <AnBodyTagEditor
            solrUrl={props.context.config.solrUrl}
            anBody={annotation.body}
            cancelledHandler={() => setEdited(false)}
            updateHandler={(newBody) => { setEdited(false); updateAn(newBody); }}/>
        </div>
      :
        <button type="button"
          className="btn btn-sm btn-outline-primary"
          data-toggle="tooltip" data-placement="bottom" title="Edit label of this annotation"
          onClick={() => setEdited(true)}>
          <icons.EditIcon/> Edit label
        </button>
      }
      <div className="row mt-2 justify-content-center">
        <SpinningWheel show={loading}/>
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
    </>
  );
}
