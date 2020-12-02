export interface ConfRec {
  appServerUrl: string;
  apiServerUrl: string;
  widgetUrl: string;
  apiPath: string;
  imgPath: string;
  solrUrl: string;
  name: string;
  version: string;
  homepage: string;
}

const confRec = (window as any).b2note as ConfRec|undefined;

export const config: ConfRec = {
  appServerUrl: confRec?.appServerUrl ? confRec.appServerUrl : "",
  apiServerUrl: confRec?.apiServerUrl ? confRec.apiServerUrl : "http://localhost:3060",
  widgetUrl: confRec?.widgetUrl ? confRec.widgetUrl : "https://b2note-dev.bsc.es/widget",
  apiPath: confRec?.apiPath ? confRec.apiPath : "/api",
  solrUrl: confRec?.solrUrl ? confRec.solrUrl : "https://b2note.eudat.eu/solr/b2note_index/select",
  imgPath: "/img/",
  name: "B2NOTE Central UI",
  version: "v0.4.0",
  homepage: "https://b2note.bsc.es"
};

export const endpointUrl = config.apiServerUrl + config.apiPath;
