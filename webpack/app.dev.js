"use strict";

const { merge } = require("webpack-merge");
const app = require("./app.js");
const dev = require("./dev.js");

module.exports = merge(app, dev) ;
