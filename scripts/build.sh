#!/bin/bash

./scripts/utils/clean.sh
./scripts/updateVersion.sh
webpack --progress --config webpack/app.prod.js
