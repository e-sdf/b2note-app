import { matchSwitch } from "@babakness/exhaustive-type-checking";
import * as React from "react";
import { SysContext, AppContext } from "app/context";
import CustomOntologiesPanel from "./customOntologies/view";
import DomainsPanel from "./domains/view";

interface Props {
  sysContext: SysContext;
  appContext: AppContext;
  profileChangedHandler: () => void;
}

enum PagesEnum {
  ONTOLOGIES = "ontologies",
  DOMAINS = "domains"
}

export default function CustomOntologiesPage(props: Props): React.FunctionComponentElement<Props> {
  const [page, setPage] = React.useState(PagesEnum.ONTOLOGIES);
  const activeFlag = (p: PagesEnum): string => p === page ? " active" : "";

  function renderNavbar(): React.ReactElement {
    return (
      <ul className="nav nav-pills flex-column bg-light p-3">
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(PagesEnum.ONTOLOGIES)} href="#"
            onClick={() => setPage(PagesEnum.ONTOLOGIES)}>
            Ontologies
          </a>
        </li>
        <li className="nav-item">
          <a
            className={"nav-link" + activeFlag(PagesEnum.DOMAINS)} href="#"
            onClick={() => setPage(PagesEnum.DOMAINS)}>
            Domains
          </a>
        </li>
      </ul>
    );
  }

  function renderPanel(): React.ReactElement {
    return matchSwitch(page, {
      [PagesEnum.ONTOLOGIES]: () => 
        <CustomOntologiesPanel 
          sysContext={props.sysContext}
          appContext={props.appContext}
          profileChangedHandler={props.profileChangedHandler}/>,
      [PagesEnum.DOMAINS]: () =>
        <DomainsPanel
          sysContext={props.sysContext}
          appContext={props.appContext}/>
    });
  }

  return (
    <div className="container-fluid d-flex flex-row pl-0">
      {renderNavbar()}
      {renderPanel()}
    </div>
  );
}