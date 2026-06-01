import { TileLayer } from '@deck.gl/geo-layers';
import type { TileLayerProps } from '@deck.gl/geo-layers';

import { KoppenBitmapLayer } from './KoppenBitmapLayer';

export const KOPPEN_TILE_URL = '/tiles/koppen/1991_2020/{z}/{x}/{y}.png';
export const KOPPEN_MIN_ZOOM = 0;
export const KOPPEN_MAX_ZOOM = 8;

type TileImage = HTMLImageElement | ImageBitmap;

type GeoBoundingBox = {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
};

type KoppenTileLayerOptions = {
  readonly visibleClassIds: readonly number[];
};

const textureParameters = {
  minFilter: 'nearest',
  magFilter: 'nearest',
  addressModeU: 'clamp-to-edge',
  addressModeV: 'clamp-to-edge',
} as const;

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

export function createKoppenTileLayer({ visibleClassIds }: KoppenTileLayerOptions) {
  const visibleClassKey = visibleClassIds.join(',');

  return new TileLayer<TileImage>({
    id: 'koppen-climate-tiles',
    data: KOPPEN_TILE_URL,
    minZoom: KOPPEN_MIN_ZOOM,
    maxZoom: KOPPEN_MAX_ZOOM,
    tileSize: 256,
    refinementStrategy: 'best-available',
    updateTriggers: {
      visibleClassIds: visibleClassKey,
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
        pickable: false,
      });
    },
  } satisfies TileLayerProps<TileImage>);
}
