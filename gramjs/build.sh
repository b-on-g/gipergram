#!/bin/sh
set -eu
cd "$( dirname "$0" )"
work=$( mktemp -d )
echo '{ "private": true }' > "$work/package.json"
npm i --prefix "$work" telegram@2.26.22 esbuild@0.24.2 buffer@6.0.3 path-browserify@1.0.1 > /dev/null
export NODE_PATH="$work/node_modules"
"$work/node_modules/.bin/esbuild" entry.js \
	--bundle --format=esm --platform=browser --target=es2020 --minify \
	--inject:./stub/buffer.js \
	--alias:crypto="$work/node_modules/telegram/crypto/crypto.js" \
	--alias:os=./stub/os.js \
	--alias:util=./stub/util.js \
	--alias:net=./stub/empty.js \
	--alias:socks=./stub/empty.js \
	--alias:fs=./stub/empty.js \
	--alias:node-localstorage=./stub/empty.js \
	--alias:path=path-browserify \
	--define:process.env.NODE_ENV='"production"' \
	--outfile=telegram.mjs
rm -rf "$work"
