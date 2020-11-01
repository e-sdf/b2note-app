#!/bin/bash

./scripts/utils/clean.sh
npx webpack --watch --progress --config webpack/app.dev.js
