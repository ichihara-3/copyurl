#!/bin/bash

# Check if dist directory exists (should be created by build process)
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. Please run 'npm run build' first."
  exit 1
fi

version=$(jq -r '.version' <dist/manifest.json)

zip -v -r copyurl_${version}.zip dist/ \
  -x '.git*' \
  -x '*img/promo/*' \
  -x '*test*' \
  -x '*.DS_Store' \
  -x '*.map'
