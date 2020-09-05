import { config } from "./config";
import render from "./pages/view";
import authStorage from "client/api/auth/storage-window";

$(() => {
  render({ config, authStorage, mbUser: null, mbTarget: null});
});