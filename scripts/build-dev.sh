#!/bin/bash

D="./dist"

echo "Purging $D..."
rm -rf $D/*
echo "Updating app version..."
./scripts/updateVersion.sh
echo "Building app..."
webpack --progress --config ./webpack/app.dev.js
cp -rv ./assets/* $D
./scripts/mkConfig.sh

