import { config } from "./config";
import render from "./pages/view";
import authStorage from "app/api/auth/storage-window";

$(() => {
  render({ config, authStorage, mbTarget: null});
});