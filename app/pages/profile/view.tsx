import _ from "lodash";
import * as React from "react";
import type { ConfRec } from "client/config";
import { Tabs, Tab } from "client/components/ui";
import type { AuthUser } from "client/context";
import type { AuthErrAction } from "client/api/http";
import type { UserProfile } from "core/user";
import PersonalInfo from "./personalInfo";
import CustomOntologies from "./customOntologies";

interface ProfileProps {
  config: ConfRec;
  user: AuthUser;
  updateProfileFn(profile: UserProfile): void;
  authErrAction: AuthErrAction;
}

enum TabType { PEROSNAL_INFO = "personalInfo", CUSTOM_ONTOLOGIES = "customOntologies" }

export default function ProfilePage(props: ProfileProps): React.FunctionComponentElement<ProfileProps> {
  const [activeTab, setActiveTab] = React.useState(TabType.CUSTOM_ONTOLOGIES);

  return (
    <div className="container">
      <h2>User Profile</h2>
      <div className="mt-4">
        <Tabs key={activeTab} id="profileTabs" activeTab={activeTab} activeHandle={setActiveTab}>
          <Tab tabId={TabType.PEROSNAL_INFO} title="Personal Information">
            <PersonalInfo
              config={props.config}
              user={props.user}
              updateProfileFn={props.updateProfileFn}
              authErrAction={props.authErrAction}/>
          </Tab>
          <Tab tabId={TabType.CUSTOM_ONTOLOGIES} title="Custom Ontologies">
            <CustomOntologies config={props.config} user={props.user} authErrAction={props.authErrAction}/>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
