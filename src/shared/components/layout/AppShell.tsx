import type { ReactNode } from 'react';

type AppShellProps = {
  readonly children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canopy-50 text-canopy-900">
      <header className="border-b border-canopy-100 bg-white/90">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-sm font-semibold uppercase tracking-wide text-canopy-700">
            Koppen Climate Map
          </span>
          <span className="rounded bg-water-100 px-3 py-1 text-sm font-medium text-water-700">
            Client preview
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
