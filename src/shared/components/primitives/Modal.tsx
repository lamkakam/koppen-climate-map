import type { ReactNode } from 'react';
import { useId } from 'react';

type ModalProps = {
  readonly children: ReactNode;
  readonly footer: ReactNode;
  readonly title: string;
};

export function Modal({
  children,
  footer,
  title,
}: ModalProps) {
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-canopy-900/70 p-4">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="w-full max-w-2xl rounded-lg border border-canopy-100 bg-white text-canopy-900 shadow-panel"
        role="dialog"
      >
        <div className="border-b border-canopy-100 px-5 py-4">
          <h2 className="text-lg font-semibold leading-7" id={titleId}>
            {title}
          </h2>
        </div>
        <div className="space-y-4 px-5 py-4 text-sm leading-6">{children}</div>
        <div className="flex justify-end border-t border-canopy-100 px-5 py-4">
          {footer}
        </div>
      </section>
    </div>
  );
}
