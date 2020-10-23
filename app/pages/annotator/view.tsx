import * as React from 'react'
import type { SysContext, AppContext } from 'app/context'
import { FormEvent } from 'react'

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
}

export default function AnnotatorPage(props: Props): React.FunctionComponentElement<Props> {
  const [pageUrlInputValue, setPageUrlInputValue] = React.useState('')
  const [pageUrl, setPageUrl] = React.useState('')

  function load(event: FormEvent) {
    event.preventDefault()

    if (pageUrlInputValue.length > 0) {
      const annotateUrl = `${props.sysContext.config.apiServerUrl}${props.sysContext.config.apiPath}/annotator?url=${encodeURIComponent(pageUrlInputValue)}`
      setPageUrl(annotateUrl)
    }
  }

  function renderNavigation() {
    return (
      <form className="form-inline" onSubmit={load}>
        <div className="form-group">
          <input
            type="text"
            value={pageUrlInputValue}
            onChange={event => setPageUrlInputValue(event.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" onClick={load} className="btn btn-primary">Load</button>
      </form>
    )
  }

  function renderPage() {
    return ( <iframe src={pageUrl} />)
  }

  function renderAnnotator() {
    return (<span>Annotator</span>)
  }

  return (
    <div className="container-fluid annotator">
      <div className="row row-bar bg-light border-bottom">
        <div className="col">
          {renderNavigation()}
        </div>
      </div>
      <div className="row row-page">
        <div className="col col-9">
          {renderPage()}
        </div>
        <div className="col col-3 bg-light">
          {renderAnnotator()}
        </div>
      </div>
    </div>
  )
}
