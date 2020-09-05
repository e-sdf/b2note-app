import type { ConfRec } from "client/config";
const confRec = (window as any).b2note as ConfRec|undefined;

export const config: ConfRec = {
  widgetServerUrl: confRec?.widgetServerUrl ? confRec.widgetServerUrl : "",
  apiServerUrl: confRec?.apiServerUrl ? confRec.apiServerUrl : "http://localhost:3060",
  apiPath: confRec?.apiPath ? confRec.apiPath : "/api",
  solrUrl: confRec?.solrUrl ? confRec.solrUrl : "https://b2note.eudat.eu/solr/b2note_index/select",
  imgPath: "img/",
  name: "B2NOTE Central UI",
  version: "v1.0.0",
  homepage: "https://b2note.bsc.es"
};

export const endpointUrl = config.apiServerUrl + config.apiPath;
export const mkResourceUrl = chrome.runtime.getURL;