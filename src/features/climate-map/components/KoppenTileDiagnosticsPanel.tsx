import { useEffect, useState } from 'react';

type KoppenTileCoordinate = {
  readonly z: number;
  readonly x: number;
  readonly y: number;
};

type CanvasReadbackSummary =
  | {
    readonly status: 'loading' | 'error';
    readonly message?: string;
  }
  | {
    readonly status: 'loaded';
    readonly naturalWidth: number;
    readonly naturalHeight: number;
    readonly alphaMin: number;
    readonly alphaMax: number;
    readonly nonzeroAlphaValues: readonly number[];
    readonly redMin: number;
    readonly redMax: number;
    readonly redValues: readonly number[];
    readonly hasUnexpectedRedClassId: boolean;
  };

type KoppenTileDiagnosticsPanelProps = {
  readonly tileCoordinate: KoppenTileCoordinate;
  readonly tileUrl: string;
};

const maxReportedValues = 16;

function formatByteValues(values: readonly number[]) {
  return values.length > 0 ? values.join(', ') : 'none';
}

function summarizeImagePixels(image: HTMLImageElement): CanvasReadbackSummary {
  const { naturalWidth, naturalHeight } = image;

  if (naturalWidth === 0 || naturalHeight === 0) {
    return {
      status: 'error',
      message: 'Image loaded without natural dimensions.',
    };
  }

  const canvas = document.createElement('canvas');
  canvas.width = naturalWidth;
  canvas.height = naturalHeight;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (context === null) {
    return {
      status: 'error',
      message: 'Canvas 2D context is unavailable.',
    };
  }

  context.drawImage(image, 0, 0);

  const pixels = context.getImageData(0, 0, naturalWidth, naturalHeight).data;
  let alphaMin = 255;
  let alphaMax = 0;
  let redMin = 255;
  let redMax = 0;
  let hasUnexpectedRedClassId = false;
  const nonzeroAlphaValues = new Set<number>();
  const redValues = new Set<number>();

  for (let byteIndex = 0; byteIndex < pixels.length; byteIndex += 4) {
    const red = pixels[byteIndex];
    const alpha = pixels[byteIndex + 3];

    redMin = Math.min(redMin, red);
    redMax = Math.max(redMax, red);
    alphaMin = Math.min(alphaMin, alpha);
    alphaMax = Math.max(alphaMax, alpha);

    if (alpha > 0) {
      if (redValues.size < maxReportedValues) {
        redValues.add(red);
      }

      if (nonzeroAlphaValues.size < maxReportedValues) {
        nonzeroAlphaValues.add(alpha);
      }

      if (red < 1 || red > 30) {
        hasUnexpectedRedClassId = true;
      }
    }
  }

  return {
    status: 'loaded',
    naturalWidth,
    naturalHeight,
    alphaMin,
    alphaMax,
    nonzeroAlphaValues: [...nonzeroAlphaValues],
    redMin,
    redMax,
    redValues: [...redValues],
    hasUnexpectedRedClassId,
  };
}

export function KoppenTileDiagnosticsPanel({
  tileCoordinate,
  tileUrl,
}: KoppenTileDiagnosticsPanelProps) {
  const [readbackSummary, setReadbackSummary] = useState<CanvasReadbackSummary>({
    status: 'loading',
  });

  useEffect(() => {
    setReadbackSummary({ status: 'loading' });
  }, [tileUrl]);

  return (
    <aside
      aria-label="Koppen tile diagnostics"
      className="pointer-events-auto absolute right-3 top-3 z-20 max-h-[calc(100vh-1.5rem)] w-[min(24rem,calc(100vw-1.5rem))] overflow-auto rounded-lg border border-canopy-100 bg-white/95 p-3 text-xs text-canopy-900 shadow-panel backdrop-blur"
    >
      <h2 className="text-sm font-semibold">Koppen tile diagnostics</h2>
      <dl className="mt-2 space-y-1">
        <div>
          <dt className="font-semibold">XYZ</dt>
          <dd className="font-mono">{`${tileCoordinate.z}/${tileCoordinate.x}/${tileCoordinate.y}`}</dd>
        </div>
        <div>
          <dt className="font-semibold">PNG URL</dt>
          <dd className="break-all font-mono">{tileUrl}</dd>
        </div>
      </dl>

      <div
        className="mt-3 flex min-h-40 items-center justify-center overflow-hidden rounded border border-canopy-100 bg-[length:16px_16px]"
        style={{
          backgroundImage:
            'linear-gradient(45deg, rgb(222 243 228) 25%, transparent 25%), linear-gradient(-45deg, rgb(222 243 228) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(222 243 228) 75%), linear-gradient(-45deg, transparent 75%, rgb(222 243 228) 75%)',
          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
        }}
      >
        <img
          alt="Raw Koppen climate PNG tile"
          className="h-64 w-64 max-w-full object-contain [image-rendering:pixelated]"
          src={tileUrl}
          onError={() => {
            setReadbackSummary({
              status: 'error',
              message: 'Image failed to load.',
            });
          }}
          onLoad={(event) => {
            setReadbackSummary(summarizeImagePixels(event.currentTarget));
          }}
        />
      </div>

      <div className="mt-3 space-y-1">
        <p>
          <span className="font-semibold">Load status:</span> {readbackSummary.status}
        </p>
        {readbackSummary.status === 'error' && (
          <p>
            <span className="font-semibold">Error:</span> {readbackSummary.message}
          </p>
        )}
        {readbackSummary.status === 'loaded' && (
          <>
            <p>
              <span className="font-semibold">Natural size:</span>{' '}
              {`${readbackSummary.naturalWidth} x ${readbackSummary.naturalHeight}`}
            </p>
            <p>
              <span className="font-semibold">Alpha min/max:</span>{' '}
              {`${readbackSummary.alphaMin}/${readbackSummary.alphaMax}`}
            </p>
            <p>
              <span className="font-semibold">Nonzero alpha values:</span>{' '}
              {formatByteValues(readbackSummary.nonzeroAlphaValues)}
            </p>
            <p>
              <span className="font-semibold">Red min/max:</span>{' '}
              {`${readbackSummary.redMin}/${readbackSummary.redMax}`}
            </p>
            <p>
              <span className="font-semibold">Nontransparent red values:</span>{' '}
              {formatByteValues(readbackSummary.redValues)}
            </p>
            <p>
              <span className="font-semibold">Nontransparent red outside 1..30:</span>{' '}
              {readbackSummary.hasUnexpectedRedClassId ? 'yes' : 'no'}
            </p>
          </>
        )}
      </div>
    </aside>
  );
}
