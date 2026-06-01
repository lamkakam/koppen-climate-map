import { TileLayer } from '@deck.gl/geo-layers';
import type { TileLayerProps } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

export const OPENSTREETMAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OPENSTREETMAP_MIN_ZOOM = 0;
export const OPENSTREETMAP_MAX_ZOOM = 19;

type TileImage = HTMLImageElement | ImageBitmap;

type GeoBoundingBox = {
  readonly west: number;
  readonly south: number;
  readonly east: number;
  readonly north: number;
};

type OpenStreetMapTileLayerOptions = {
  readonly opacity: number;
};

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

export function createOpenStreetMapTileLayer({ opacity }: OpenStreetMapTileLayerOptions) {
  return new TileLayer<TileImage>({
    id: 'openstreetmap-base-tiles',
    data: OPENSTREETMAP_TILE_URL,
    minZoom: OPENSTREETMAP_MIN_ZOOM,
    maxZoom: OPENSTREETMAP_MAX_ZOOM,
    tileSize: 256,
    opacity,
    refinementStrategy: 'best-available',
    onTileError: () => undefined,
    updateTriggers: {
      opacity,
    },
    renderSubLayers: (props) => {
      const { bbox } = props.tile;

      if (!isGeoBoundingBox(bbox)) {
        return undefined;
      }

      return new BitmapLayer({
        id: props.id,
        image: props.data,
        bounds: [bbox.west, bbox.south, bbox.east, bbox.north],
        opacity,
        pickable: false,
      });
    },
  } satisfies TileLayerProps<TileImage>);
}
