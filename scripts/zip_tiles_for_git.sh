#!/usr/bin/env bash

# Usage: zip the tiles generated from preprocess_geotiff.sh for git
# as the tiles are git-ignored
tar -czvf data/tiles.tar.gz public/tiles