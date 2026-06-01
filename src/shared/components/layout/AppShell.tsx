import type { ReactNode } from 'react';

type AppShellProps = {
  readonly children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canopy-50 text-canopy-900">
      <main>{children}</main>
    </div>
  );
}
