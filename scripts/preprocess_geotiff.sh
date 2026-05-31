#!/usr/bin/env bash

gdal_calc.py \
  -A "${1}" \
  --A_band=1 \
  --calc="A" \
  --type=Byte \
  --NoDataValue=0 \
  --outfile=koppen_ids_byte.tif

# EPSG:3857 for Web Mercator projection
# -r near for nearest neighbor resampling to preserve categorical data
gdalwarp \
  -t_srs EPSG:3857 \
  -r near \
  -ot Byte \
  -dstnodata 0 \
  koppen_ids_byte.tif \
  koppen_ids_3857.tif

# -z 0-8 for zoom levels 0 to 8
# --xyz for XYZ tile scheme (OSM Slippy Map tiles)
# --tilesize=256 for 256x256 tiles
gdal2tiles.py \
  -z 0-8 \
  -r near \
  --xyz \
  --tilesize=256 \
  koppen_ids_3857.tif \
  "public/tiles/koppen/${2}"

rm koppen_ids_byte.tif koppen_ids_3857.tif