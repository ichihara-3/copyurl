#!/bin/bash

version=$(jq -r '.version' <src/manifest.json)

zip -v -r copyurl_${version}.zip src/ \
  -x '.git*' \
  -x '*img/promo/*' \
  -x '*test*' \
  -x '*.DS_Store'
