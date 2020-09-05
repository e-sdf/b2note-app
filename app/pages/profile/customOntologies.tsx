import _ from "lodash";
import { $enum } from "ts-enum-util";
import * as React from "react";
import type { ConfRec } from "client/config";
import type { AuthUser } from "client/context";
import type { AuthErrAction } from "client/api/http";
import type { UserProfile } from "core/user";
import { OntologyFormat } from "core/ontologyRegister";
import * as api from "client/api/profile";
import Alert from "client/components/alert";
import SpinningWheel from "client/components/spinningWheel";
import * as icons from "client/components/icons";

interface Props {
  config: ConfRec;
  user: AuthUser;
  authErrAction: AuthErrAction;
}

export default function CustomOntologies(props: Props): React.FunctionComponentElement<Props> {
  const [uploadFromDiskDialog, setUploadFromDiskDialog] = React.useState(false);
  const [uploadFromUrlDialog, setUploadFromUrlDialog] = React.useState(false);
  const [urlForUploading, setUrlForUploading] = React.useState("");
  const [importFormat, setImportFormat] = React.useState(OntologyFormat.TURTLE);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);

  React.useEffect(() => setErrorMessage(null), [successMessage]);
  React.useEffect(() => { if (loading) { setErrorMessage(null); } }, [loading]);

  function uploadFromUrl(): void {
    setLoading(true);
    api.importOntologyPm(props.config, urlForUploading, importFormat, props.user.token, props.authErrAction).then(
      res => {
        setLoading(false);
        console.log(res);
      },
      err => { setLoading(false); setErrorMessage("Error downloading ontology: " + err); }
    );
  }

  function renderAddMenuButton(): React.ReactElement {
    return (
      <div className="d-flex flex-row">
        <button type="button" className="btn btn-primary"
          onClick={() => setUploadFromDiskDialog(true)}>
          <icons.DiskIcon/> Import Ontology from Disk
        </button>
        <button type="button" className="btn btn-primary ml-2"
          onClick={() => setUploadFromUrlDialog(true)}>
          <icons.UploadIcon/> Import Ontology from URL
        </button>
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
              <div className="form-check">
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
    <div className="container mt-2">
      {!uploadFromUrlDialog && !uploadFromDiskDialog ?
        renderAddMenuButton()
      : uploadFromDiskDialog ?
        renderUploadFromDiskDialog()
      : renderUploadFromUrlDialog()}
      <div className="d-flex flex-row justify-content-center mt-2">
        <SpinningWheel show={loading}/>
        <Alert type="success" message={successMessage} closedHandler={() => setSuccessMessage(null)}/>
        <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)}/>
      </div>
    </div>
  );
}
