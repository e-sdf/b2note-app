import { config } from "./config";
import render from "./pages/view";
import authStorage from "app/api/auth/storage-window";

$(() => {
  console.log("[B2NOTE-APP] started")
  render({ config, authStorage, mbTarget: null});
});