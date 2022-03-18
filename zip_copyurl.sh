#!/bin/bash

version=$(jq -r '.version' <copyurl/manifest.json)

zip -v -r copyurl_${version}.zip copyurl/ \
  -x '.git*' \
  -x '*img/promo/*' \
  -x '*test*' \
  -x '*.DS_Store'
