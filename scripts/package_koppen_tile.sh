#!/usr/bin/env bash
set -euo pipefail

TILE_PATH="${1:-public/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif}"
TAR_TILE_PATH="${TILE_PATH#public/}"
ARCHIVE_PATH="data/${TAR_TILE_PATH}.tar.gz"

mkdir -p "$(dirname "${ARCHIVE_PATH}")"

tar -czf "${ARCHIVE_PATH}" -C public "${TAR_TILE_PATH}"
