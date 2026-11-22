#!/bin/sh
set -eu

site_dir=$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)
container=merchendice-links-port81

if [ ! -s "$site_dir/index.html" ]; then
    echo 'Place index.html beside this script before deploying.' >&2
    exit 1
fi

sudo docker run --detach --restart unless-stopped \
    --name "$container" \
    --publish 81:80 \
    --mount "type=bind,source=$site_dir/index.html,target=/usr/share/nginx/html/index.html,readonly" \
    nginx:alpine

curl --fail --silent --show-error --retry 5 --retry-connrefused \
    --output /dev/null http://127.0.0.1:81/
echo 'Merchendice Links is serving on port 81.'
