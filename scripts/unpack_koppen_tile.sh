#!/usr/bin/env bash
set -euo pipefail

ARCHIVE_PATH="${1:-data/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif.tar.gz}"

mkdir -p public
tar -xzf "${ARCHIVE_PATH}" -C public
