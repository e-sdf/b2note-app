#!/bin/bash

./scripts/utils/clean.sh
webpack --watch --progress --config webpack/app.dev.js
