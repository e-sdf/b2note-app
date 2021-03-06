#!/bin/bash

# Create the config.js to provide client run-time config variables
C=dist/server/public/app/js/config.js
JS_APP_SERVER_URL=`[ -z "$JS_APP_SERVER_URL" ] && echo "http://localhost:3070/app" || echo "$JS_APP_SERVER_URL"` 
JS_API_SERVER_URL=`[ -z "$JS_API_SERVER_URL" ] && echo "http://localhost:3060" || echo "$JS_API_SERVER_URL"` 
JS_WIDGET_URL=`[ -z "$JS_WIDGET_URL" ] && echo "http://localhost:3061/widget" || echo "$JS_WIDGET_URL"` 
JS_API_PATH=`[ -z "$JS_API_PATH" ] && echo "/api" || echo "$JS_API_PATH"` 
echo -n "window.b2note = { appServerUrl: '"$JS_APP_SERVER_URL"', apiServerUrl: '"$JS_API_SERVER_URL"', widgetUrl: '"$JS_WIDGET_URL"', apiPath: '"$JS_API_PATH"' };" > $C

echo "$C created"