import * as React from "react";
import type {SysContext, AppContext} from "app/context";
import {FormEvent} from "react";
import _ from "lodash";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

type AnnotatorState =
  | { kind: "initial" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "error", message: string }


export default function AnnotatorPage(props: Props): React.FunctionComponentElement<Props> {
  const [pageUrlInputValue, setPageUrlInputValue] = React.useState("");
  const [pageUrl, setPageUrl] = React.useState("");
  const [key, setKey] = React.useState(0);
  const [annotatorState, setAnnotatorState] = React.useState({kind: "initial"} as AnnotatorState);

  const isLoading = annotatorState.kind == "loading";
  const isSuccess = annotatorState.kind == "success";

  function load(event: FormEvent) {
    event.preventDefault();

    if (pageUrlInputValue.length > 0) {
      const apiRoot = `${props.sysContext.config.apiServerUrl}${props.sysContext.config.apiPath}`;
      const annotateUrl = `${apiRoot}/annotator?url=${encodeURIComponent(pageUrlInputValue)}`;
      setPageUrl(annotateUrl);
      setKey(key + 1);
      setAnnotatorState({kind: "loading"});
    }
  }


  React.useEffect(() => {
    const handler = (event: MessageEvent) => {
      const type = _.get(event, "data.type");

      if (type === "iframe.loaded") {
        setAnnotatorState({kind: "success"});
      } else if (type === "iframe.error") {
        setAnnotatorState({kind: "error", message: _.get(event, "data.error", "Unable to open the page")});
      }

    };

    window.addEventListener("message", handler);

    return () => {
      window.removeEventListener("message", handler);
    };
  });

  function renderNavigation() {
    return (
      <form className="form-inline" onSubmit={load}>
        <div className="form-group">
          <input
            type="text"
            value={pageUrlInputValue}
            onChange={event => setPageUrlInputValue(event.target.value)}
            placeholder="Enter the page URL"
            className="form-control"
          />
        </div>
        <button type="submit" onClick={load} className="btn btn-primary">Load</button>
      </form>
    );
  }

  function renderPage() {
    return (pageUrl.length > 0 ?
      <iframe key={key} src={pageUrl} style={{display: isSuccess ? "block" : "none"}}/> : <></>);
  }

  function renderAnnotator() {
    return (<span>Annotator</span>);
  }

  function renderError() {
    return (
      annotatorState.kind == "error" ?
        <Alert message={annotatorState.message} type="danger"
               closedHandler={() => setAnnotatorState({kind: "initial"})}/>
        : <></>
    );
  }

  return (
    <div className="container-fluid annotator">
      <div className="row row-bar bg-light border-bottom">
        <div className="col">
          {renderNavigation()}
        </div>
      </div>
      <div className="row row-page">
        <div
          className={`col ${isSuccess ? "col-9" : ""} ${isLoading ? "d-flex align-items-center justify-content-center" : ""}`}
        >
          {<SpinningWheel show={isLoading}/>}
          {renderError()}
          {renderPage()}
        </div>
        <div className="col col-3 bg-light" style={{display: isSuccess ? "block" : "none"}}>
          {renderAnnotator()}
        </div>
      </div>
    </div>
  );
}
