import allSettled from "promise.allsettled";
import * as config from "app/config";
import type { AuthUser, AppContext } from "app/context";
import type { AuthErrAction } from "core/http";
import { get, post, patch, del } from "core/http";
import { OntologyGetQuery, OntologyPatchQuery } from "core/apiModels/ontologyQueryModel";
import type { OTermsDict } from "core/ontologyRegister";
import type { OntologyMeta, Ontology, OntologyFormat, OntologyTerm } from "core/ontologyRegister";
import * as oreg from "core/ontologyRegister";

const ontologiesUrl = config.endpointUrl + oreg.ontologiesUrl;

export function getCustomOntologiesMetas(user: AuthUser, authErrAction: AuthErrAction): Promise<Array<OntologyMeta>> {
  return get(ontologiesUrl, {}, { token: user.token, authErrAction });
}

export function getOntology(user: AuthUser, ontId: string, authErrAction: AuthErrAction): Promise<Ontology> {
  return get(ontologiesUrl + "/" + ontId , {}, { token: user.token, authErrAction });
}

export function importOntology(user: AuthUser, ontUrl: string, format: OntologyFormat, authErrAction: AuthErrAction): Promise<any> {
  return post(ontologiesUrl, { url: ontUrl, format } as OntologyGetQuery,  { token: user.token, authErrAction });
}

export function updateOntologyName(user: AuthUser, ontId: string, name: string, authErrAction: AuthErrAction): Promise<any> {
  return patch(ontologiesUrl, { id: ontId, name } as OntologyPatchQuery, { token: user.token, authErrAction });
}

export function deleteOntology(user: AuthUser, o: OntologyMeta, authErrAction: AuthErrAction): Promise<any> {
  return del(ontologiesUrl + "/" + o.id, { token: user.token, authErrAction });
}

export function findOTerms(appContext: AppContext, query: string): Promise<OTermsDict> {
  return new Promise((resolve, reject) => {
    const params = appContext.mbUser ? { token: appContext.mbUser.token, authErrAction: appContext.authErrAction } : undefined;
    get<OTermsDict>(ontologiesUrl, { value: query + "*"}, params ).then(
      res => resolve(res),
      err => reject(err)
    );
  });
}

export async function getOTerm(appContext: AppContext, value: string): Promise<OTermsDict> {
  return new Promise((resolve, reject) => {
    const params = appContext.mbUser ? { token: appContext.mbUser.token, authErrAction: appContext.authErrAction } : undefined;
    get<OTermsDict>(ontologiesUrl, { value }, params ).then(
      res => resolve(res),
      err => reject(err)
    );
  });
}

// Getting ontology info {{{1

function getInfo(appContext: AppContext, ontologyUri: string): Promise<OntologyTerm> {
  return new Promise((resolve, reject) => {
    const params = appContext.mbUser ? { token: appContext.mbUser.token, authErrAction: appContext.authErrAction } : undefined;
    get<OntologyTerm>(ontologiesUrl, { uri: ontologyUri }, params ).then(
      res => resolve(res),
      err => reject(err)
    );
  });
}

export function loadOntologiesInfo(appContext: AppContext, iris: Array<string>): Promise<Array<OntologyTerm>> {
  return new Promise((resolve, reject) => {
    const infoPms = iris.map((iri: string) => getInfo(appContext, iri));
    allSettled<OntologyTerm>(infoPms).then(
      (results) => {
        const settled = results.filter(r => r.status === "fulfilled") as Array<allSettled.PromiseResolution<OntologyTerm>>;
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
