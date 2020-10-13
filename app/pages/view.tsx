import { matchSwitch } from '@babakness/exhaustive-type-checking';
import * as React from "react";
import * as ReactDOM from "react-dom";
import { config } from "app/config";
import type { SysContext, AppContext } from "app/context";
import type { Token } from "core/http";
import { AuthProvidersEnum } from "app/api/auth/defs";
import * as auth from "app/api/auth/auth";
import * as profileApi from "app/api/profile";
import * as icons from "app/components/icons";
import { PagesEnum } from "app/pages/pages";
import AuthProviderSelectionPage from "app/pages/login";
import AnnotatorPage from "app/pages/annotator/view";
import CustomOntologiesPage from "app/pages/customOntologies/view";
import ProfilePage from "app/pages/profile";

enum LoginStateEnum { NOT_LOGGED, LOGGING, LOGGED, ERROR }

interface Props {
  sysContext: SysContext;
}

function MainView(props: Props): React.FunctionComponentElement<Props> {
  const [page, setPage] = React.useState(PagesEnum.ONTOLOGIES);
  const [appContext, setAppContext] = React.useState({ mbUser: null, authErrAction: loginPm } as AppContext);
  const [authProvider, setAuthProvider] = React.useState(null as null|AuthProvidersEnum);
  const [chosenAuthProvider, setChosenAuthProvider] = React.useState(null as null | AuthProvidersEnum);
  const [loginState, setLoginState] = React.useState(LoginStateEnum.NOT_LOGGED);

  function retrieveProfile(provider: AuthProvidersEnum|null, token: Token|null): void {
    if (provider && token) {
      profileApi.getUserProfilePm(config, token, () => auth.loginPm(props.sysContext, provider)).then(
        profile => {
          setLoginState(LoginStateEnum.LOGGED);
          setAppContext({ ...appContext, mbUser: { token, profile }});
        },
        err => {
          setLoginState(LoginStateEnum.ERROR);
          console.error(err);
        }
      );
    }
  }

  function loginPm(): Promise<Token|null> {
    return new Promise((resolve, reject) => {

      function cancel() {
        setLoginState(LoginStateEnum.NOT_LOGGED);
        resolve(null);
      }

      setLoginState(LoginStateEnum.LOGGING);
      if (chosenAuthProvider) {
        auth.loginPm(props.sysContext, chosenAuthProvider, cancel).then(
          token => {
            retrieveProfile(chosenAuthProvider, token);
            resolve(token);
          },
          err => {
            setLoginState(LoginStateEnum.ERROR);
            console.error(err);
            reject();
          }
        );
      } else {
        setPage(PagesEnum.LOGIN);
        reject();
      }
    });
  }

  function firstLogin(): void {
    props.sysContext.authStorage.retrieve().then(
      sAuth => {
        setLoginState(LoginStateEnum.LOGGING);
        setAuthProvider(sAuth.provider);
        retrieveProfile(sAuth.provider, sAuth.token);
      },
      () => setPage(PagesEnum.LOGIN)
    );
  }

  function logout(): void {
    props.sysContext.authStorage.delete().then(
      () => {
      setAppContext({ ...appContext, mbUser: null });
      setLoginState(LoginStateEnum.NOT_LOGGED);
      setAuthProvider(null);
      setChosenAuthProvider(null);
      }
    );
  }

  React.useEffect(() => {
    if (loginState === LoginStateEnum.NOT_LOGGED) {
      firstLogin();
    }
  }, []);

  React.useEffect(
    () => {
      if (chosenAuthProvider !== null) {
        setAuthProvider(chosenAuthProvider);
        loginPm().then(() => setPage(PagesEnum.PROFILE));
      }
    },
    [chosenAuthProvider]
  );

  function pageComp(): React.ReactElement {
    return matchSwitch(page, {
      [PagesEnum.LOGIN]: () => <AuthProviderSelectionPage config={config} selectedHandler={(p) => setChosenAuthProvider(p)}/>,
      [PagesEnum.PROFILE]: () =>
        appContext.mbUser ?
          <ProfilePage
            config={props.sysContext.config}
            user={appContext.mbUser}
            updateProfileFn={() => retrieveProfile(authProvider, appContext.mbUser?.token ? appContext.mbUser.token : null)} authErrAction={() => loginPm()}/>
        : <></>,
        [PagesEnum.ANNOTATOR]: () => 
          <AnnotatorPage 
            sysContext={props.sysContext}
            appContext={appContext}/>,
        [PagesEnum.ONTOLOGIES]: () => 
          <CustomOntologiesPage 
            sysContext={props.sysContext}
            appContext={appContext}
            profileChangedHandler={() => retrieveProfile(authProvider, appContext.mbUser?.token || null)}/>
    });
  }

  function renderNavbar(): React.ReactElement {
    const activeFlag = (p: PagesEnum): string => p === page ? " active" : "";

    return (
      <nav className="navbar navbar-expand-md navbar-light bg-light pr-0">
        <ul className="navbar-nav" style={{width: "100%"}}>
          <li className="nav-item">
            <a
              className={"nav-link" + activeFlag(PagesEnum.ANNOTATOR)} href="#"
              onClick={() => setPage(PagesEnum.ANNOTATOR)}>
              Annotator
            </a>
          </li>
          <li className="nav-item">
            <a
              className={"nav-link" + activeFlag(PagesEnum.ONTOLOGIES)} href="#"
              onClick={() => setPage(PagesEnum.ONTOLOGIES)}>
              Custom Ontologies
            </a>
          </li>
          <li className="nav-item ml-auto">
            <a
              className={"nav-link" + activeFlag(PagesEnum.PROFILE)} href="#"
              data-toggle="tooltip" data-placement="bottom" title={appContext.mbUser ? appContext.mbUser.profile.email : "Login"}
              onClick={() =>
                matchSwitch(loginState, {
                  [LoginStateEnum.NOT_LOGGED]: () => firstLogin(),
                  [LoginStateEnum.LOGGING]: () => void(null),
                  [LoginStateEnum.LOGGED]: () => setPage(PagesEnum.PROFILE),
                  [LoginStateEnum.ERROR]: () => firstLogin()
                })}>
              {matchSwitch(loginState, {
                [LoginStateEnum.NOT_LOGGED]: () => <span>Login</span>,
                [LoginStateEnum.LOGGING]: () => <span>Logging in...</span>,
                [LoginStateEnum.LOGGED]:
                  () => <span><icons.UserIcon/> {appContext.mbUser?.profile.personName || ""}</span>,
                [LoginStateEnum.ERROR]:
                  () => <span style={{fontSize: "90%"}}>Login error, try again</span>
              })}
            </a>
          </li>
          {loginState === LoginStateEnum.LOGGED ?
            <li className="nav-item">
              <a className="nav-link" style={{paddingLeft: 0}}
                href="#"data-toggle="tooltip"
                data-placement="bottom" title="Logout"
                onClick={logout}
              ><icons.LogoutIcon/></a>
            </li>
          : <></>
          }
        </ul>
      </nav>
    );
  }

  function renderBanner(): React.ReactElement {
    return (
      <nav className="navbar navbar-expand-md navbar-dark navbar-custom">
        <a className="navbar-brand" href="#">
          <img src="img/logo-cropped.png" style={{height: "50px"}} alt="logo"/>
        </a>
        <span style={{color: "white", fontSize: "20px", marginLeft: "25px"}}>
            The EUDAT and EOSC-Hub annotation service
        </span>
        <div className="badge badge-info ml-4" style={{fontSize: "125%"}}>
          Central UI
        </div>
        <div id="widget-version" className="ml-auto pl-2">
          <a href="https://github.com/e-sdf/b2note-app/releases"
            style={{color: "#e7e6ff"}}
            target="_blank" rel="noopener noreferrer">
            {config.version}
          </a>
        </div>
      </nav>
    );
  }

  return (
    <div>
      {renderBanner()}
      {renderNavbar()}
      {pageComp()}
    </div>
  );
}

export default function render(sysContext: SysContext): void {
  const container = document.getElementById("b2note-app");
  if (container) {
    ReactDOM.render(<MainView sysContext={sysContext}/>, container);
  } else {
    console.error("[B2NOTE APP]: DOM element missing");
  }
}
