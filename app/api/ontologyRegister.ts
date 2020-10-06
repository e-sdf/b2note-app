import allSettled from "promise.allsettled";
import * as config from "app/config";
import type { AuthUser } from "app/context";
import type { Ontology, OntologyTerm } from "core/ontologyRegister";
import type { AuthErrAction } from "./http";
import { get, post, del } from "app/api/http";
import * as oreg from "core/ontologyRegister";

const url = config.endpointUrl + oreg.ontologyRegisterUrl;

export function loadOntologies(): Promise<Array<oreg.Ontology>> {
  return get(url);
}

export function importOntology(user: AuthUser, ontUrl: string, format: oreg.OntologyFormat, authErrAction: AuthErrAction): Promise<any> {
  return post(url, { url: ontUrl, format },  { token: user.token, authErrAction });
}

export function deleteOntology(user: AuthUser, o: Ontology, authErrAction: AuthErrAction): Promise<any> {
  return del(url + "/" + o.id, { token: user.token, authErrAction });
}

export function loadOntologiesInfo(solrUrl: string, iris: Array<string>): Promise<Array<OntologyTerm>> {
  return new Promise((resolve, reject) => {
    const infoPms = iris.map((iri: string) => oreg.getInfo(solrUrl, iri));
    allSettled<oreg.OntologyTerm>(infoPms).then(
      (results) => {
        const settled = results.filter(r => r.status === "fulfilled") as Array<allSettled.PromiseResolution<oreg.OntologyTerm>>;
        const infos = settled.map(s  => s.value);
        if (infos.length === 0) {
          reject("No results returned");
        } else {
          resolve(infos);
        }
      }
    );
  });
}
