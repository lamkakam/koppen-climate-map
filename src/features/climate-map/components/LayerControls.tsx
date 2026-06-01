import { koppenClasses } from '../data/koppenClasses';

type LayerControlsProps = {
  readonly visibleClassIds: ReadonlySet<number>;
  readonly onShowAll: () => void;
  readonly onHideAll: () => void;
  readonly onToggleClass: (classId: number) => void;
};

export function LayerControls({
  visibleClassIds,
  onShowAll,
  onHideAll,
  onToggleClass,
}: LayerControlsProps) {
  return (
    <aside
      aria-label="Koppen climate classes"
      className="pointer-events-auto max-h-[calc(100vh-2rem)] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-canopy-100 bg-white/95 shadow-panel backdrop-blur"
    >
      <div className="border-b border-canopy-100 px-4 py-3">
        <h1 className="text-base font-semibold text-canopy-900">Koppen climate map</h1>
        <div className="mt-3 flex gap-2">
          <button
            aria-label="Show all Koppen climate classes"
            className="min-h-10 flex-1 rounded-md bg-canopy-700 px-3 text-sm font-semibold text-white transition-colors duration-200 ease-standard hover:bg-canopy-900"
            type="button"
            onClick={onShowAll}
          >
            Show all
          </button>
          <button
            aria-label="Hide all Koppen climate classes"
            className="min-h-10 flex-1 rounded-md border border-canopy-100 bg-white px-3 text-sm font-semibold text-canopy-900 transition-colors duration-200 ease-standard hover:bg-canopy-50"
            type="button"
            onClick={onHideAll}
          >
            Hide all
          </button>
        </div>
      </div>

      <div
        aria-label="Koppen climate classes"
        className="max-h-[calc(100vh-9.5rem)] overflow-y-auto px-2 py-2"
        role="group"
      >
        {koppenClasses.map((koppenClass) => {
          const [red, green, blue] = koppenClass.color;
          const checked = visibleClassIds.has(koppenClass.id);
          const checkboxId = `koppen-class-${koppenClass.id}`;

          return (
            <label
              htmlFor={checkboxId}
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-canopy-900 transition-colors duration-200 ease-standard hover:bg-canopy-50"
              key={koppenClass.id}
            >
              <input
                aria-label={`${koppenClass.code} ${koppenClass.label}`}
                checked={checked}
                className="h-4 w-4 accent-canopy-700"
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
              <span className="w-10 shrink-0 font-mono text-sm font-semibold">{koppenClass.code}</span>
              <span className="min-w-0 flex-1 leading-5">{koppenClass.label}</span>
            </label>
          );
        })}
      </div>
    </aside>
  );
}
