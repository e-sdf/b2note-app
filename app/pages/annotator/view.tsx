import * as React from "react";
import type {SysContext, AppContext} from "app/context";
import {FormEvent} from "react";
import _ from "lodash";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";
import {FormBuilder} from "app/utils/formBuilder";
import {config} from "app/config";

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
  const [widgetOpen, setWidgetOpen] = React.useState(false);

  const isLoading = annotatorState.kind == "loading";
  const isSuccess = annotatorState.kind == "success";

  function load(event: FormEvent) {
    event.preventDefault();

    if (pageUrlInputValue.length > 0) {
      const apiRoot = `${props.sysContext.config.apiServerUrl}${props.sysContext.config.apiPath}`;
      const annotateUrl = `${apiRoot}/annotator?url=${encodeURIComponent(pageUrlInputValue)}&root=1`;
      setPageUrl(annotateUrl);
      setKey(key + 1);
      setAnnotatorState({kind: "loading"});
      setWidgetOpen(false);
    }
  }

  function submitForm(data: Record<string, string> = {}): void {
    const formBuilder = new FormBuilder(config.widgetUrl, "post", "annotator");
    Object.entries(data).forEach(([name, value]) => {
      formBuilder.withInput(name, value);
    });

    const form = formBuilder.getForm();
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    setWidgetOpen(true);
  }


  React.useEffect(() => {
    const handler = (event: MessageEvent) => {
      const type = _.get(event, "data.type");

      switch (type) {
        case "iframe.loaded":
          setAnnotatorState({kind: "success"});
          break;

        case "iframe.error":
          setAnnotatorState({kind: "error", message: _.get(event, "data.error", "Unable to open the page")});
          break;

        case "iframe.annotate":
          submitForm(_.get(event, "data.data", {}));
          break;
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
    return (<iframe name="annotator"/>);
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
          className={`col ${isLoading ? "d-flex align-items-center justify-content-center" : ""}`}
        >
          {<SpinningWheel show={isLoading}/>}
          {renderError()}
          {renderPage()}
        </div>
        <div className="col-annotator" style={{display: widgetOpen ? "block" : "none"}}>
          {renderAnnotator()}
        </div>
      </div>
    </div>
  );
}
