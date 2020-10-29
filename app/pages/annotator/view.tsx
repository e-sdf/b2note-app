import * as React from "react";
import type {SysContext, AppContext} from "app/context";
import {FormEvent} from "react";
import _ from "lodash";
import SpinningWheel from "app/components/spinningWheel";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function AnnotatorPage(props: Props): React.FunctionComponentElement<Props> {
  const [pageUrlInputValue, setPageUrlInputValue] = React.useState("");
  const [pageUrl, setPageUrl] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [key, setKey] = React.useState(0);

  function load(event: FormEvent) {
    event.preventDefault();

    if (pageUrlInputValue.length > 0) {
      const annotateUrl = `${props.sysContext.config.apiServerUrl}${props.sysContext.config.apiPath}/annotator?url=${encodeURIComponent(pageUrlInputValue)}`;
      setPageUrl(annotateUrl);
      setKey(key + 1);
      setIsLoading(true);
    }
  }


  React.useEffect(() => {
    const handler = (event: MessageEvent) => {
      const type = _.get(event, "data.type");

      if (type === "iframe.loaded") {
        setIsLoading(false);
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
      <iframe key={key} src={pageUrl} style={{display: isLoading ? "none" : "block"}}/> : <></>);
  }

  function renderAnnotator() {
    return (<span>Annotator</span>);
  }

  return (
    <div className="container-fluid annotator">
      <div className="row row-bar bg-light border-bottom">
        <div className="col">
          {renderNavigation()}
        </div>
      </div>
      <div className="row row-page">
        <div className="col col-9 d-flex align-items-center justify-content-center">
          {<SpinningWheel show={isLoading}/>}
          {renderPage()}
        </div>
        <div className="col col-3 bg-light">
          {renderAnnotator()}
        </div>
      </div>
    </div>
  );
}
