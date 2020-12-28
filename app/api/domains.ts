import type { Token, AuthErrAction } from "core/http";
import { get, post, patch, del } from "core/http";
import type { ConfRec } from "app/config";
import type { Domain } from "core/domainModel";
import type { DomainPostQuery, DomainPatchQuery } from "core/apiModels/domainQueryModel";
import { domainsUrl } from "core/domainModel";

function mkDomainsUrl(config: ConfRec): string {
  return config.apiServerUrl + config.apiPath + domainsUrl;
}

export function getDomainsPm(config: ConfRec): Promise<Array<Domain>> {
  return get(mkDomainsUrl(config));
}

export function addDomain(config: ConfRec, name: string, token: Token, authErrAction: AuthErrAction): Promise<void> {
  return post(mkDomainsUrl(config), { name } as DomainPostQuery, { token, authErrAction });
}

export function patchDomainPm(config: ConfRec, changes: DomainPatchQuery, token: Token, authErrAction: AuthErrAction): Promise<Domain> {
  return patch<Domain>(mkDomainsUrl(config), { ...changes }, { token, authErrAction });
}

export function deleteDomain(config: ConfRec, d: Domain, token: Token, authErrAction: AuthErrAction): Promise<void> {
  return del(mkDomainsUrl(config) + "/" + d.id, { token, authErrAction });
}
