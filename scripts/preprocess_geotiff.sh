#!/usr/bin/env bash
set -euo pipefail

SOURCE_TIF="${1:-koppen_geiger_tif/1991_2020/koppen_geiger_0p00833333.tif}"
OUTPUT_TIF="${2:-public/tiles/koppen/1991_2020/koppen_geiger_0p00833333_rgba_cog.tif}"

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "${WORK_DIR}"' EXIT

mkdir -p "$(dirname "${OUTPUT_TIF}")"

gdal_calc.py \
  -A "${SOURCE_TIF}" \
  --A_band=1 \
  --calc="A" \
  --type=Byte \
  --NoDataValue=0 \
  --outfile="${WORK_DIR}/koppen_class_byte.tif"

gdal_calc.py \
  -A "${SOURCE_TIF}" \
  --A_band=1 \
  --calc="255*(A>0)" \
  --type=Byte \
  --NoDataValue=0 \
  --outfile="${WORK_DIR}/koppen_alpha_byte.tif"

gdalbuildvrt \
  -separate \
  "${WORK_DIR}/koppen_rgba.vrt" \
  "${WORK_DIR}/koppen_class_byte.tif" \
  "${WORK_DIR}/koppen_class_byte.tif" \
  "${WORK_DIR}/koppen_class_byte.tif" \
  "${WORK_DIR}/koppen_alpha_byte.tif"

gdal_translate \
  -of COG \
  -colorinterp red,green,blue,alpha \
  -co COMPRESS=DEFLATE \
  -co BLOCKSIZE=256 \
  -co RESAMPLING=NEAREST \
  -co OVERVIEW_RESAMPLING=NEAREST \
  "${WORK_DIR}/koppen_rgba.vrt" \
  "${OUTPUT_TIF}"
