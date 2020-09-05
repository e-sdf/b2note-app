#!/bin/bash

# Create the config.js to provide client run-time config variables

D="./dist"

JS_APP_SERVER_URL=""
JS_API_SERVER_URL="http://localhost:3060"
JS_API_PATH="/api"
JS_SOLR_URL="https://b2note.eudat.eu/solr/b2note_index/select"

echo "Building config.js..."
C=$D/js/config.js
echo -n "window.b2note = { appServerUrl: '"$JS_APP_SERVER_URL"', apiServerUrl: '"$JS_API_SERVER_URL"', apiPath: '"$JS_API_PATH"', solrUrl: '"$JS_SOLR_URL"' };" > $C
cat "$C"
