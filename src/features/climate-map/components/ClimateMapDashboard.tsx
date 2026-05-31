import { useState } from 'react';

const climateClasses = [
  { label: 'Tropical', value: 'Af', colorClass: 'bg-canopy-500' },
  { label: 'Dry', value: 'BWh', colorClass: 'bg-terrain-500' },
  { label: 'Temperate', value: 'Cfb', colorClass: 'bg-water-500' },
  { label: 'Continental', value: 'Dfb', colorClass: 'bg-ember-500' },
] as const;

export function ClimateMapDashboard() {
  const [layersVisible, setLayersVisible] = useState(true);

  return (
    <section aria-labelledby="climate-map-title" className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <div className="rounded-lg border border-canopy-100 bg-white p-5 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-canopy-700">Global classification workspace</p>
            <h1 id="climate-map-title" className="mt-2 text-3xl font-semibold text-canopy-900">
              Koppen climate map
            </h1>
          </div>
          <button
            aria-label={layersVisible ? 'Hide climate layers' : 'Show climate layers'}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-canopy-700 px-4 text-sm font-semibold text-white transition-transform duration-200 ease-standard will-change-transform hover:scale-[1.02] hover:bg-canopy-900"
            type="button"
            onClick={() => {
              setLayersVisible((isVisible) => !isVisible);
            }}
          >
            {layersVisible ? 'Layers visible' : 'Layers hidden'}
          </button>
        </div>

        <div
          aria-label="Climate map preview"
          className="mt-6 grid min-h-72 grid-cols-4 overflow-hidden rounded-md border border-canopy-100"
          role="img"
        >
          {climateClasses.map((climateClass) => (
            <div
              className={`${climateClass.colorClass} ${
                layersVisible ? 'opacity-90' : 'opacity-25'
              } transition-opacity duration-300 ease-standard`}
              key={climateClass.value}
            />
          ))}
        </div>
      </div>

      <aside aria-label="Climate classes" className="rounded-lg border border-canopy-100 bg-white p-5">
        <h2 className="text-base font-semibold text-canopy-900">Tracked classes</h2>
        <dl className="mt-4 grid gap-3">
          {climateClasses.map((climateClass) => (
            <div className="flex items-center justify-between gap-4" key={climateClass.value}>
              <dt className="flex items-center gap-3 text-sm text-canopy-700">
                <span
                  aria-hidden="true"
                  className={`h-3 w-3 rounded-sm ${climateClass.colorClass}`}
                />
                {climateClass.label}
              </dt>
              <dd className="font-mono text-sm font-semibold text-canopy-900">{climateClass.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}
