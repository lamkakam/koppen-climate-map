import { MapView } from '@deck.gl/core';
import type { MapViewState } from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import { useMemo, useState } from 'react';

import { koppenClassIds } from '../data/koppenClasses';
import { KOPPEN_MIN_ZOOM, createKoppenTileLayer } from '../layers/KoppenTileLayer';
import { LayerControls } from './LayerControls';

const maxInteractionZoom = 12;

const initialViewState = {
  longitude: 0,
  latitude: 20,
  zoom: 1.4,
  minZoom: KOPPEN_MIN_ZOOM,
  maxZoom: maxInteractionZoom,
  pitch: 0,
  bearing: 0,
};

const mapView = new MapView({ repeat: true });

function clampViewState(viewState: MapViewState): MapViewState {
  return {
    ...viewState,
    minZoom: KOPPEN_MIN_ZOOM,
    maxZoom: maxInteractionZoom,
    zoom: Math.min(maxInteractionZoom, Math.max(KOPPEN_MIN_ZOOM, viewState.zoom)),
  };
}

export function ClimateMapDashboard() {
  const [viewState, setViewState] = useState<MapViewState>(initialViewState);
  const [visibleClassIds, setVisibleClassIds] = useState<ReadonlySet<number>>(
    () => new Set(koppenClassIds),
  );

  const visibleClassIdList = useMemo(() => [...visibleClassIds], [visibleClassIds]);
  const layers = useMemo(
    () => [createKoppenTileLayer({ visibleClassIds: visibleClassIdList })],
    [visibleClassIdList],
  );

  return (
    <section
      aria-label="Koppen climate raster map"
      className="relative h-screen min-h-[32rem] overflow-hidden bg-[#d8e2dc]"
    >
      <DeckGL
        controller
        layers={layers}
        viewState={viewState}
        views={mapView}
        onViewStateChange={({ viewState: nextViewState }) => {
          setViewState(clampViewState(nextViewState));
        }}
      />

      <div className="pointer-events-none absolute left-4 top-4 z-10">
        <LayerControls
          visibleClassIds={visibleClassIds}
          onHideAll={() => {
            setVisibleClassIds(new Set());
          }}
          onShowAll={() => {
            setVisibleClassIds(new Set(koppenClassIds));
          }}
          onToggleClass={(classId) => {
            setVisibleClassIds((currentVisibleClassIds) => {
              const nextVisibleClassIds = new Set(currentVisibleClassIds);

              if (nextVisibleClassIds.has(classId)) {
                nextVisibleClassIds.delete(classId);
              } else {
                nextVisibleClassIds.add(classId);
              }

              return nextVisibleClassIds;
            });
          }}
        />
      </div>
    </section>
  );
}
