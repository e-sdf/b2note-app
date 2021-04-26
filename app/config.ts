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
  widgetUrl: confRec?.widgetUrl ? confRec.widgetUrl : "http://localhost:3061/widget",
  apiPath: confRec?.apiPath ? confRec.apiPath : "/api",
  solrUrl: confRec?.solrUrl ? confRec.solrUrl : "https://b2note.eudat.eu/solr/b2note_index/select",
  imgPath: "/img/",
  name: "B2NOTE Central UI",
  version: "v1.3.1",
  homepage: "https://b2note.bsc.es"
};

console.log("[B2NOTE-APP] Config:");
console.log(config);

export const endpointUrl = config.apiServerUrl + config.apiPath;
