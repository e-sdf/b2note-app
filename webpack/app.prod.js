"use strict";

const { merge } = require("webpack-merge");
const app = require("./app.js");
const prod = require("./prod.js");

module.exports = merge(app, prod) ;
