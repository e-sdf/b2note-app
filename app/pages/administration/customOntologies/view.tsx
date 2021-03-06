import { $enum } from "ts-enum-util";
import * as React from "react";
import type { OntologyMeta } from "core/ontologyRegister";
import { OntologyFormat } from "core/ontologyRegister";
import * as oApi from "app/api/ontologyRegister";
import { SysContext, AppContext } from "app/context";
import OntologiesList from "./list";
import OntologyDetailView from "./detailView";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";
import * as icons from "app/components/icons";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  profileChangedHandler: () => void;
}

export default function CustomOntologiesPanel(props: Props): React.FunctionComponentElement<Props> {
  const [ontologies, setOntologies] = React.useState([] as Array<OntologyMeta>);
  const [uploadFromDiskDialog, setUploadFromDiskDialog] = React.useState(false);
  const [uploadFromUrlDialog, setUploadFromUrlDialog] = React.useState(false);
  const [urlForUploading, setUrlForUploading] = React.useState("");
  const [importFormat, setImportFormat] = React.useState(OntologyFormat.TURTLE);
  const [detailRequest, setDetailRequest] = React.useState(null as OntologyMeta|null);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);

  const mbUser = props.appContext.mbUser;

  function loadOntologies(): void {
    if (mbUser) {
      setLoading(true);
      oApi.getCustomOntologiesMetas(mbUser, props.appContext.authErrAction).then(
        onts => { setOntologies(onts); setLoading(false); },
        err => setErrorMessage(err)
      );
    }
  }

  React.useEffect(() => loadOntologies(), [mbUser]);

  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  function uploadFromUrl(): void {
    if (mbUser) {
      setLoading(true);
      oApi.importOntology(mbUser, urlForUploading, importFormat, props.appContext.authErrAction).then(
        () => {
          setLoading(false);
          setUploadFromUrlDialog(false);
          setUrlForUploading("");
          loadOntologies();
          props.profileChangedHandler();
        },
        err => { setLoading(false); setErrorMessage("Import error: " + err); }
      );
    }
  }

  function renderAddButtons(): React.ReactElement {
    return (
      <div className="d-flex flex-row justify-content-center">
        <button type="button" className="btn btn-primary ml-2"
          disabled={mbUser == null}
          onClick={() => setUploadFromUrlDialog(true)}>
          <icons.UrlIcon/> Import Ontology from URL
        </button>
        {/*
          <button type="button" className="btn btn-primary ml-2"
          disabled={mbUser == null}
          onClick={() => setUploadFromDiskDialog(true)}>
          <icons.UploadIcon/> Import Ontology from Disk
        </button>
        */}
      </div>
    );
  }

  function renderUploadFromDiskDialog(): React.ReactElement {
    return (
      <div>TODO</div>
    );
  }

  function renderUploadFromUrlDialog(): React.ReactElement {

    function renderFormatOptions(): React.ReactElement {
      return (
        <div className="form-group">
          {$enum(OntologyFormat).getKeys().map(
            format =>
              <div key={format} className="form-check">
                <label>
                  <input
                    type="radio"
                    name="input-format"
                    value={OntologyFormat[format]}
                    checked={importFormat === OntologyFormat[format]}
                    onChange={ev => setImportFormat(ev.target.value as OntologyFormat)}
                    className="form-check-input"
                  />
                  {OntologyFormat[format]}
                </label>
              </div>
          )}
        </div>
      );
    }

    return (
      <div className="card">
        <div className="card-body">
          <div className="form-group">
            <label>URL of ontology to upload:</label>
            <input className="form-control"
              value={urlForUploading}
              onChange={ev => setUrlForUploading(ev.target.value)}/>
          </div>
          {renderFormatOptions()}
          <div className="form-group d-flex flex-row">
            <button type="button" className="btn btn-primary"
              disabled={urlForUploading.length === 0}
              onClick={() => uploadFromUrl()}>
              <icons.UploadIcon/> Upload
            </button>
            <button type="button" className="btn btn-danger ml-2"
              onClick={() => setUploadFromUrlDialog(false)}>
              <icons.CancelIcon/> Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {detailRequest ?
        <OntologyDetailView
          appContext={props.appContext}
          ontologyMeta={detailRequest}
          closeHandler={() => setDetailRequest(null)}/>
      :
        <>
          <OntologiesList
            sysContext={props.sysContext}
            appContext={props.appContext}
            ontologies={ontologies}
            errorHandler={err => setErrorMessage(err)}
            loadingHandler={flag => setLoading(flag)}
            ontologyChangedHandler={() => loadOntologies()}
            profileChangedHandler={() => props.profileChangedHandler()}
            detailRequestHandler={o => setDetailRequest(o)}/>
          <div className="d-flex flex-row justify-content-center mt-2">
            <SpinningWheel show={loading}/>
            <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
          </div>
          <div className="container mt-2">
            {!uploadFromUrlDialog && !uploadFromDiskDialog ?
              renderAddButtons()
            : uploadFromDiskDialog ?
              renderUploadFromDiskDialog()
            : renderUploadFromUrlDialog()}
          </div>
        </>
      }
    </div>
  );
}
