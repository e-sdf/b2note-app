#!/bin/bash

./scripts/utils/clean.sh
./scripts/updateVersion.sh
npx webpack --progress --config webpack/app.prod.js
