import _ from "lodash";
import * as React from "react";
import { SysContext, AppContext } from "app/context";
import { $enum } from "ts-enum-util";
import { Typeahead } from "react-bootstrap-typeahead";
import type { AuthUser } from "app/context";
import type { AuthErrAction } from "core/http";
import type { UserProfile } from "core/user";
import { countries, Experience } from "core/user";
import type { Domain } from "core/domainModel";
import * as api from "app/api/profile";
import * as dApi from "app/api/domains";
import Tag from "app/components/tag";
import DomainEditor from "app/components/domainEditor";
import Alert from "app/components/alert";
import SpinningWheel from "app/components/spinningWheel";
import * as icons from "app/components/icons";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  user: AuthUser;
  updateProfileFn(profile: UserProfile): void;
  authErrAction: AuthErrAction;
}

export default function ProfilePage(props: Props): React.FunctionComponentElement<Props> {
  const profile = props.user.profile;
  const [domains, setDomains] = React.useState([] as Array<Domain>);
  const [newDomain, setNewDomain] = React.useState(false);
  const [givenName, setGivenName] = React.useState(profile.givenName);
  const [familyName, setFamilyName] = React.useState(profile.familyName);
  const [personName, setPersonName] = React.useState(profile.personName);
  const [orcid, setOrcid] = React.useState(profile.orcid);
  const [organisation, setOrganisation] = React.useState(profile.organisation);
  const [jobTitle, setJobTitle] = React.useState(profile.jobTitle);
  const [country, setCountry] = React.useState(profile.country);
  const [domainsIds, setDomainsIds] = React.useState(profile.domainsIds || []);
  const [experience, setExperience] = React.useState(profile.experience);
  const [loading, setLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null as string|null);
  const [errorMessage, setErrorMessage] = React.useState(null as string|null);
  const fields = [givenName, familyName, personName, orcid, organisation, jobTitle, country, domainsIds, experience];
  const [changed, setChanged] = React.useState(false);

  function getFields(): Partial<UserProfile> {
    const givenName2 = givenName.length > 0 ? { givenName } : {};
    const familyName2 = familyName.length > 0 ? { familyName } : {};
    const personName2 = personName.length > 0 ? { personName } : {};
    const orcid2 = orcid.length > 0 ? { orcid } : {};
    const organisation2 = organisation.length > 0 ? { organisation } : {};
    const jobTitle2 = jobTitle.length > 0 ? { jobTitle } : {};
    const country2 = country.length > 0 ? { country } : {};
    const domainsIds2 = domainsIds.length > 0 ? { domainsIds } : {};
    const experience2 = experience.length > 0 ? { experience } : {};
    const changes = { ...givenName2, ...familyName2, ...personName2, ...orcid2, ...organisation2, ...jobTitle2, ...country2, ...domainsIds2, ...experience2 };
    return changes;
  }

  function getDomain(id: string): Domain|undefined {
    return domains.find(d => d.id === id);
  }

  React.useEffect(
    () => { 
      dApi.getDomains().then(
        ds => setDomains(ds),
        err => setErrorMessage(err)
      );
    },
    [profile]
  );

  React.useEffect(
    () => {
      const current: Partial<UserProfile> = {
        givenName,
        familyName,
        personName,
        orcid,
        organisation,
        jobTitle,
        country,
        domainsIds,
        experience
      };
      const orig: Partial<UserProfile> = {
        givenName: profile.givenName,
        familyName: profile.familyName,
        personName: profile.personName,
        orcid: profile.orcid,
        organisation: profile.organisation,
        jobTitle: profile.jobTitle,
        country: profile.country,
        domainsIds: profile.domainsIds,
        experience: profile.experience
      };
      setChanged(!_.isEqual(current, orig));
    },
    fields
  );


  function postProfile(): void {
    setLoading(true);
    api.patchUserProfilePm(props.sysContext.config, getFields(), props.user.token, props.authErrAction).then(
      updatedProfile => {
        props.updateProfileFn(updatedProfile);
        setLoading(false);
        setChanged(false);
        setSuccessMessage("Profile updated");
      },
      () => { setLoading(false); setErrorMessage("Profile update failed"); }
    );
  }

  function renderCountryInput(): React.ReactElement {
    return (
      <div className="col">
        <label>Country</label>
        <Typeahead
          id="profile-country-autocomplete"
          options={countries}
          selected={[country]}
          onChange={selected => {
            if (selected.length > 0) {
              setCountry(selected[0]);
            } else {
              setCountry("");
            }
          }} />
      </div>
    );
  }

  function renderDomainsIdsInput(): React.ReactElement {
    return (
      <div className="form-group">
        <label>Domains of Interest</label>
        <div>
          {domainsIds.map(
            did => {
              const mbDomain = getDomain(did);
              return (
                mbDomain ?
                  <Tag 
                    id={did}
                    tag={mbDomain.name}
                    deletePmFn={() => Promise.resolve(setDomainsIds(domainsIds.filter(d => d !== did)))}
                  />
                  : <></>
              );
            }
          )}
          {newDomain ?
            <DomainEditor
              appContext={props.appContext}
              options={domains.filter(d => !domainsIds?.includes(d.id))}
              updatePmFn={d => Promise.resolve(setDomainsIds([...domainsIds, d.id]))}
              doneHandler={() => setNewDomain(false)}
              cancelledHandler={() => setNewDomain(false)}
            />
          : 
            <a href="#" onClick={() => setNewDomain(true)}>
              <icons.AddIcon />
            </a>
          }
        </div>
      </div>
    );
  }

  function renderExperienceInput(): React.ReactElement {
    return (
      <div className="form-group">
        <label>Annotator Experience</label>
        <select className="form-control" value={experience} onChange={ev => setExperience(ev.target.value as Experience)}>
          <option key="none" value=""></option>
          {$enum(Experience).getKeys()
            .filter(exp => Experience[exp].length > 0)
            .map(exp => <option key={exp} value={Experience[exp]}>{Experience[exp]}</option>
          )}
        </select>
      </div>
    );
  }

  function renderSaveButton(): React.ReactElement {
    return (
      <div className="form-group d-flex flex-row justify-content-center">
        <button type="button" className="btn btn-primary"
          disabled={!changed}
          onClick={() => postProfile()}>
          Save
      </button>
      </div>
    );
  }

  return (
    <div className="container mt-2">
      <h2>User Profile</h2>
      <div className="form-group form-row">
        <div className="col">
          <label>B2NOTE ID</label>
          <input type="text" className="form-control" readOnly
            data-toggle="tooltip" data-placement="bottom" title="B2NOTE user persistent identifier; read-only, value provided by B2NOTE"
            value={profile?.id || ""} />
        </div>
        <div className="col">
          <label>E-mail</label>
          <input type="email" className="form-control" readOnly
            data-toggle="tooltip" data-placement="bottom" title="Read-only, value provided by B2ACCESS"
            value={profile?.email || ""} />
        </div>
        <div className="col">
          <label>ORCID ID</label>
          <input type="text" className="form-control"
            value={orcid}
            onChange={ev => setOrcid(ev.target.value)} />
        </div>
      </div>
      <div className="form-group form-row">
        <div className="col">
          <label>Given Name</label>
          <input type="text" className="form-control"
            value={givenName}
            onChange={ev => setGivenName(ev.target.value)} />
        </div>
        <div className="col">
          <label>Family Name</label>
          <input type="text" className="form-control"
            value={familyName}
            onChange={ev => setFamilyName(ev.target.value)} />
        </div>
        <div className="col">
          <label>Name</label>
          <input type="text" className="form-control"
            value={personName}
            onChange={ev => setPersonName(ev.target.value)} />
        </div>
      </div>
      <div className="form-group form-row">
        <div className="col">
          <label>Organisation</label>
          <input type="text" className="form-control"
            value={organisation}
            onChange={ev => setOrganisation(ev.target.value)} />
        </div>
        <div className="col">
          <label>Job Title</label>
          <input type="text" className="form-control"
            value={jobTitle}
            onChange={ev => setJobTitle(ev.target.value)} />
        </div>
        {renderCountryInput()}
      </div>
      {renderExperienceInput()}
      {renderDomainsIdsInput()}
      {successMessage || errorMessage ?
        <div className="d-flex flex-row justify-content-center">
          <SpinningWheel show={loading} />
          <Alert type="success" message={successMessage} closedHandler={() => setSuccessMessage(null)} />
          <Alert type="danger" message={errorMessage} closedHandler={() => setErrorMessage(null)} />
        </div>
      : renderSaveButton()}
    </div>
  );
}
