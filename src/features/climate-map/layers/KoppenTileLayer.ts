import { TileLayer } from '@deck.gl/geo-layers';
import type { TileLayerProps } from '@deck.gl/geo-layers';
import type { SamplerProps } from '@luma.gl/core';

import { KoppenBitmapLayer } from './KoppenBitmapLayer';
import { decodeKoppenPng } from './koppenPngDecoder';

export const KOPPEN_TILE_URL = '/tiles/koppen/1991_2020/{z}/{x}/{y}.png';
export const KOPPEN_MIN_ZOOM = 0;
export const KOPPEN_MAX_ZOOM = 8;

type TileImage = ImageData;

type GeoBoundingBox = {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
};

type KoppenTileLayerOptions = {
  readonly visibleClassIds: readonly number[];
  readonly opacity: number;
};

const textureParameters = {
  minFilter: 'nearest',
  magFilter: 'nearest',
  mipmapFilter: 'none',
  lodMinClamp: 0,
  lodMaxClamp: 0,
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge',
} as const satisfies SamplerProps;

function isGeoBoundingBox(value: unknown): value is GeoBoundingBox {
  return (
    typeof value === 'object'
    && value !== undefined
    && value !== null
    && 'west' in value
    && 'south' in value
    && 'east' in value
    && 'north' in value
  );
}

export function createKoppenTileLayer({ visibleClassIds, opacity }: KoppenTileLayerOptions) {
  const visibleClassKey = visibleClassIds.join(',');

  return new TileLayer<TileImage>({
    id: 'koppen-climate-tiles',
    data: KOPPEN_TILE_URL,
    minZoom: KOPPEN_MIN_ZOOM,
    maxZoom: KOPPEN_MAX_ZOOM,
    tileSize: 256,
    opacity,
    refinementStrategy: 'best-available',
    updateTriggers: {
      visibleClassIds: visibleClassKey,
      opacity,
    },
    getTileData: async ({ url, signal }) => {
      if (url === undefined || url === null) {
        throw new Error('Missing Koppen tile URL');
      }

      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`Failed to load Koppen tile ${url}: ${response.status}`);
      }

      const decodedTile = decodeKoppenPng(await response.arrayBuffer());

      return new ImageData(decodedTile.data, decodedTile.width, decodedTile.height);
    },
    renderSubLayers: (props) => {
      const { bbox } = props.tile;

      if (!isGeoBoundingBox(bbox)) {
        return null;
      }

      return new KoppenBitmapLayer({
        id: props.id,
        image: props.data,
        bounds: [bbox.west, bbox.south, bbox.east, bbox.north],
        textureParameters,
        visibleClassIds,
        koppenOpacity: opacity,
        opacity: 1,
        pickable: false,
      });
    },
  } satisfies TileLayerProps<TileImage>);
}
