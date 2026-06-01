import { useState } from 'react';

import { koppenClasses } from '../data/koppenClasses';

type LayerControlsProps = {
  readonly visibleClassIds: ReadonlySet<number>;
  readonly osmOpacity: number;
  readonly koppenOpacity: number;
  readonly onShowAll: () => void;
  readonly onHideAll: () => void;
  readonly onToggleClass: (classId: number) => void;
  readonly onOsmOpacityChange: (opacity: number) => void;
  readonly onKoppenOpacityChange: (opacity: number) => void;
};

export function LayerControls({
  visibleClassIds,
  osmOpacity,
  koppenOpacity,
  onShowAll,
  onHideAll,
  onToggleClass,
  onOsmOpacityChange,
  onKoppenOpacityChange,
}: LayerControlsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const osmOpacityInputId = 'openstreetmap-opacity';
  const koppenOpacityInputId = 'koppen-opacity';
  const toggleLabel = isExpanded ? 'Collapse layer controls' : 'Expand layer controls';

  return (
    <aside
      aria-label="Layer controls"
      className="pointer-events-auto relative max-h-[calc(50vh-3rem)] w-full overflow-visible rounded-t-lg border border-canopy-100 bg-white/95 shadow-panel backdrop-blur lg:max-h-[calc(100vh-2rem)] lg:w-[min(22rem,calc(100vw-2rem))] lg:rounded-lg"
    >
      <div className="max-h-[calc(50vh-3rem)] overflow-hidden rounded-t-lg lg:max-h-[calc(100vh-2rem)] lg:rounded-lg">
        <div className="border-b border-canopy-100 px-4 py-2 lg:py-3">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base font-semibold text-canopy-900">Koppen climate map</h1>
            <button
              aria-expanded={isExpanded}
              aria-label={toggleLabel}
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md border border-canopy-100 bg-white text-xl font-semibold leading-none text-canopy-900 transition-colors duration-200 ease-standard hover:bg-canopy-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700 lg:flex"
              type="button"
              onClick={() => {
                setIsExpanded((currentIsExpanded) => !currentIsExpanded);
              }}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 border-b-2 border-r-2 border-current transition-transform duration-200 ease-standard will-change-transform ${
                  isExpanded ? '-rotate-[135deg]' : 'rotate-45'
                }`}
                data-testid="desktop-layer-controls-chevron"
              />
            </button>
          </div>
          <div
            aria-hidden={!isExpanded}
            className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-standard will-change-[max-height,opacity] ${
              isExpanded
                ? 'max-h-[calc(50vh-8rem)] opacity-100 lg:max-h-[calc(100vh-12rem)]'
                : 'max-h-0 opacity-0'
            }`}
            data-testid="layer-controls-panel"
            inert={!isExpanded}
          >
            <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-3 lg:block lg:space-y-3">
              <label
                className="block text-xs font-medium text-canopy-900 lg:text-sm"
                htmlFor={osmOpacityInputId}
              >
                <span className="flex items-start justify-between gap-1">
                  <span>Map opacity</span>
                  <span>{`${Math.round(osmOpacity * 100)}%`}</span>
                </span>
                <input
                  aria-label="Map opacity"
                  className="mt-1 h-2 w-full accent-canopy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700 lg:mt-2"
                  id={osmOpacityInputId}
                  max="100"
                  min="0"
                  type="range"
                  value={Math.round(osmOpacity * 100)}
                  onChange={(event) => {
                    onOsmOpacityChange(Number(event.target.value) / 100);
                  }}
                />
              </label>
              <label
                className="block text-xs font-medium text-canopy-900 lg:text-sm"
                htmlFor={koppenOpacityInputId}
              >
                <span className="flex items-start justify-between gap-1">
                  <span>Koppen opacity</span>
                  <span>{`${Math.round(koppenOpacity * 100)}%`}</span>
                </span>
                <input
                  aria-label="Koppen opacity"
                  className="mt-1 h-2 w-full accent-canopy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700 lg:mt-2"
                  id={koppenOpacityInputId}
                  max="100"
                  min="0"
                  type="range"
                  value={Math.round(koppenOpacity * 100)}
                  onChange={(event) => {
                    onKoppenOpacityChange(Number(event.target.value) / 100);
                  }}
                />
              </label>
            </div>
            <div className="mt-2 flex gap-2 lg:mt-3">
              <button
                aria-label="Show all Koppen climate classes"
                className="min-h-8 flex-1 rounded-md bg-canopy-700 px-2 py-1 text-xs font-semibold text-white transition-colors duration-200 ease-standard hover:bg-canopy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700 lg:min-h-10 lg:px-3 lg:py-0 lg:text-sm"
                type="button"
                onClick={onShowAll}
              >
                Show all
              </button>
              <button
                aria-label="Hide all Koppen climate classes"
                className="min-h-8 flex-1 rounded-md border border-canopy-100 bg-white px-2 py-1 text-xs font-semibold text-canopy-900 transition-colors duration-200 ease-standard hover:bg-canopy-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700 lg:min-h-10 lg:px-3 lg:py-0 lg:text-sm"
                type="button"
                onClick={onHideAll}
              >
                Hide all
              </button>
            </div>
          </div>
        </div>

        <div
          aria-hidden={!isExpanded}
          aria-label="Koppen climate classes"
          className={`grid grid-cols-[repeat(auto-fit,minmax(4.75rem,1fr))] gap-1 overflow-y-auto px-2 transition-[max-height,opacity] duration-200 ease-standard will-change-[max-height,opacity] lg:block ${
            isExpanded
              ? 'max-h-[calc(50vh-11.5rem)] py-1.5 opacity-100 lg:max-h-[calc(100vh-22rem)] lg:py-2'
              : 'max-h-0 py-0 opacity-0'
          }`}
          data-testid="koppen-class-list"
          inert={!isExpanded}
          role="group"
        >
          {koppenClasses.map((koppenClass) => {
            const [red, green, blue] = koppenClass.color;
            const checked = visibleClassIds.has(koppenClass.id);
            const checkboxId = `koppen-class-${koppenClass.id}`;

            return (
              <label
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-canopy-900 transition-colors duration-200 ease-standard hover:bg-canopy-50 lg:min-h-11 lg:gap-3"
                data-testid={`koppen-class-${koppenClass.id}-control`}
                htmlFor={checkboxId}
                key={koppenClass.id}
              >
                <input
                  aria-label={`${koppenClass.code} ${koppenClass.label}`}
                  checked={checked}
                  className="h-4 w-4 shrink-0 accent-canopy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700"
                  id={checkboxId}
                  type="checkbox"
                  onChange={() => {
                    onToggleClass(koppenClass.id);
                  }}
                />
                <span
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 rounded-sm border border-black/10"
                  style={{ backgroundColor: `rgb(${red} ${green} ${blue})` }}
                />
                <span className="inline-flex h-5 shrink-0 translate-y-px items-center font-mono text-sm font-semibold leading-none lg:w-10">
                  {koppenClass.code}
                </span>
                <span className="hidden min-w-0 flex-1 leading-5 lg:block">
                  {koppenClass.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
      <button
        aria-expanded={isExpanded}
        aria-label={toggleLabel}
        className="absolute bottom-0 left-1/2 flex h-9 w-16 -translate-x-1/2 translate-y-full items-center justify-center rounded-b-md border border-t-0 border-canopy-100 bg-white/95 text-lg font-semibold leading-none text-canopy-900 shadow-panel transition-colors duration-200 ease-standard hover:bg-canopy-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700 lg:hidden"
        type="button"
        onClick={() => {
          setIsExpanded((currentIsExpanded) => !currentIsExpanded);
        }}
      >
        <span
          aria-hidden="true"
          className={`h-2 w-2 border-b-2 border-r-2 border-current transition-transform duration-200 ease-standard will-change-transform ${
            isExpanded ? 'rotate-45' : '-rotate-[135deg]'
          }`}
          data-testid="mobile-layer-controls-chevron"
        />
      </button>
      <a
        className="absolute bottom-0 left-[calc(50%+2.25rem)] right-2 flex min-h-9 translate-y-full items-center rounded bg-white/95 px-2 text-xs font-medium leading-tight text-canopy-900 shadow-panel underline decoration-canopy-900/40 underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700 lg:hidden"
        href="https://www.openstreetmap.org/copyright"
      >
        © OpenStreetMap Contributors
      </a>
    </aside>
  );
}
