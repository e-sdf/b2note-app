import * as config from "app/config";
import type { Token, AuthErrAction } from "core/http";
import { get, post, patch, del } from "core/http";
import type { ConfRec } from "app/config";
import type { Domain } from "core/domainModel";
import type { DomainPostQuery, DomainPatchQuery } from "core/apiModels/domainQueryModel";
import * as model from "core/domainModel";

const domainsUrl = config.endpointUrl + model.domainsUrl;

export function getDomains(): Promise<Array<Domain>> {
  return get(domainsUrl);
}

export function getDomain(id: string): Promise<Domain> {
  return get(domainsUrl + "/" + id);
}

export function addDomain(name: string, token: Token, authErrAction: AuthErrAction): Promise<void> {
  return post(domainsUrl, { name } as DomainPostQuery, { token, authErrAction });
}

export function patchDomain(changes: DomainPatchQuery, token: Token, authErrAction: AuthErrAction): Promise<any> {
  return patch(domainsUrl, changes, { token, authErrAction });
}

export function deleteDomain(config: ConfRec, d: Domain, token: Token, authErrAction: AuthErrAction): Promise<void> {
  return del(domainsUrl + "/" + d.id, { token, authErrAction });
}
