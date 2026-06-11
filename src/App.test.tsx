import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { App } from './App';
import { KOPPEN_COG_URL } from './features/climate-map/layers/KoppenTileLayer';

type TileLayerProps = {
  readonly id?: string;
  readonly data?: string;
  readonly minZoom?: number;
  readonly maxZoom?: number;
  readonly tileSize?: number;
  readonly opacity?: number;
  readonly updateTriggers?: {
    readonly visibleClassIds?: string;
    readonly opacity?: number;
  };
};

const tileLayerProps: TileLayerProps[] = [];

function getCheckboxInputs() {
  return screen.getAllByRole('checkbox') as HTMLInputElement[];
}

vi.mock('@deck.gl/core', () => ({
  MapView: function MockMapView(this: { props: unknown }, props: unknown) {
    this.props = props;
  },
}));

vi.mock('@deck.gl/react', () => ({
  default: ({ children }: { readonly children?: ReactNode }) => (
    <div data-testid="deck-gl-canvas">{children}</div>
  ),
}));

vi.mock('@deck.gl/geo-layers', () => ({
  TileLayer: function MockTileLayer(this: { props: TileLayerProps }, props: TileLayerProps) {
    this.props = props;
    tileLayerProps.push(props);
  },
}));

vi.mock('@deck.gl/layers', () => ({
  BitmapLayer: function MockBitmapLayer(this: { props: unknown }, props: unknown) {
    this.props = props;
  },
}));

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
    tileLayerProps.length = 0;
  });

  it('shows the data license notice when it has not been dismissed', () => {
    render(<App />);

    expect(
      screen.getByRole('dialog', { name: /data license and attribution/i }),
    ).toBeVisible();
    expect(
      screen.getByText(/Creative Commons Attribution 4\.0 International license/i),
    ).toBeVisible();
  });

  it('renders the license and citation links with the correct URLs', () => {
    render(<App />);

    expect(screen.getByRole('link', { name: 'CC BY 4.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/4.0/',
    );
    expect(
      screen.getByRole('link', {
        name: 'High-resolution (1 km) Köppen-Geiger maps for 1901-2099 based on constrained CMIP6 projections',
      }),
    ).toHaveAttribute('href', 'https://www.nature.com/articles/s41597-023-02549-6');
  });

  it('dismisses the data license notice and stores the acknowledgement', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(
      screen.getByRole('button', { name: /acknowledge data license notice/i }),
    );

    expect(
      screen.queryByRole('dialog', { name: /data license and attribution/i }),
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem('koppenClimateMap.dataLicenseNoticeDismissed'),
    ).toBe('true');
  });

  it('does not show the data license notice after it has been dismissed', () => {
    window.localStorage.setItem('koppenClimateMap.dataLicenseNoticeDismissed', 'true');

    render(<App />);

    expect(
      screen.queryByRole('dialog', { name: /data license and attribution/i }),
    ).not.toBeInTheDocument();
  });

  it('renders the fullscreen climate map and controls', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /köppen climate raster map/i })).toBeVisible();
    expect(screen.getByRole('complementary', { name: /layer controls/i })).toBeVisible();
    expect(screen.getByRole('group', { name: /köppen climate classes/i })).toBeVisible();
    expect(screen.getByRole('slider', { name: /map opacity/i })).toHaveValue('100');
    expect(screen.getByRole('slider', { name: /köppen opacity/i })).toHaveValue('75');
    expect(screen.getAllByRole('link', { name: /openstreetmap contributors/i })[0]).toHaveAttribute(
      'href',
      'https://www.openstreetmap.org/copyright',
    );
  });

  it('creates OpenStreetMap and Koppen tile layers in draw order', () => {
    render(<App />);

    expect(tileLayerProps).toHaveLength(2);
    expect(tileLayerProps[0]).toMatchObject({
      id: 'openstreetmap-base-tiles',
      data: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      minZoom: 0,
      maxZoom: 19,
      tileSize: 256,
      opacity: 1,
    });
    expect(tileLayerProps[1]).toMatchObject({
      id: 'koppen-climate-tiles',
      data: KOPPEN_COG_URL,
      opacity: 0.75,
    });
  });

  it('renders every Koppen class checkbox', () => {
    render(<App />);

    expect(screen.getAllByRole('checkbox')).toHaveLength(30);
    expect(screen.getByRole('checkbox', { name: /Af tropical rainforest/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /EF ice cap/i })).toBeChecked();
  });

  it('collapses and expands layer controls without changing class selection', async () => {
    const user = userEvent.setup();

    render(<App />);

    const tropicalRainforestCheckbox = screen.getByRole('checkbox', {
      name: /Af tropical rainforest/i,
    });
    await user.click(tropicalRainforestCheckbox);
    expect(tropicalRainforestCheckbox).not.toBeChecked();

    await user.click(screen.getAllByRole('button', { name: /collapse layer controls/i })[0]);

    expect(screen.getByTestId('koppen-class-list')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('koppen-class-list')).toHaveClass('max-h-0', 'opacity-0');
    expect(screen.getAllByRole('link', { name: /openstreetmap contributors/i })[0]).toHaveAttribute(
      'href',
      'https://www.openstreetmap.org/copyright',
    );

    await user.click(screen.getAllByRole('button', { name: /expand layer controls/i })[0]);

    expect(screen.getByRole('checkbox', { name: /Af tropical rainforest/i })).not.toBeChecked();
  });

  it('animates the layer controls panel collapse state', async () => {
    const user = userEvent.setup();

    render(<App />);

    const panel = screen.getByTestId('layer-controls-panel');
    expect(panel).toHaveClass(
      'transition-[max-height,opacity]',
      'duration-200',
      'ease-standard',
      'will-change-[max-height,opacity]',
      'opacity-100',
    );

    await user.click(screen.getAllByRole('button', { name: /collapse layer controls/i })[0]);

    expect(panel).toHaveClass('max-h-0', 'opacity-0');
  });

  it('animates consistently sized chevrons while toggling rotation classes', async () => {
    const user = userEvent.setup();

    render(<App />);

    const collapseButton = screen.getAllByRole('button', {
      name: /collapse layer controls/i,
    })[0];
    expect(within(collapseButton).getByTestId('desktop-layer-controls-chevron')).toHaveClass(
      'transition-transform',
      'duration-200',
      'ease-standard',
      'will-change-transform',
      '-rotate-[135deg]',
    );
    expect(screen.getByTestId('mobile-layer-controls-chevron')).toHaveClass(
      'transition-transform',
      'duration-200',
      'ease-standard',
      'will-change-transform',
      'rotate-45',
    );

    await user.click(collapseButton);

    expect(
      within(screen.getAllByRole('button', { name: /expand layer controls/i })[0]).getByTestId(
        'desktop-layer-controls-chevron',
      ),
    ).toHaveClass(
      'transition-transform',
      'duration-200',
      'ease-standard',
      'will-change-transform',
      'rotate-45',
    );
    expect(screen.getByTestId('mobile-layer-controls-chevron')).toHaveClass('-rotate-[135deg]');
  });

  it('keeps descriptions in checkbox names while compacting visible mobile class text', () => {
    render(<App />);

    expect(screen.getByRole('checkbox', { name: /Af tropical rainforest/i })).toBeChecked();
    expect(screen.getByText('Tropical rainforest')).toHaveClass('hidden');
  });

  it('optically aligns visible class codes with their descriptions', () => {
    render(<App />);

    const tropicalRainforestControl = screen.getByTestId('koppen-class-1-control');
    const classCode = within(tropicalRainforestControl).getByText('Af');
    const classDescription = within(tropicalRainforestControl).getByText('Tropical rainforest');

    expect(classCode).toHaveClass(
      'inline-flex',
      'h-5',
      'translate-y-px',
      'items-center',
      'leading-none',
    );
    expect(classDescription).toHaveClass('leading-5');
  });

  it('does not show class description tooltips from focus or touch interaction', () => {
    render(<App />);

    const tropicalRainforestCheckbox = screen.getByRole('checkbox', {
      name: /Af tropical rainforest/i,
    });
    fireEvent.focus(tropicalRainforestCheckbox);

    expect(screen.queryByRole('tooltip', { name: /tropical rainforest/i })).not.toBeInTheDocument();

    fireEvent.pointerDown(screen.getByText('Af'), { pointerType: 'touch' });

    expect(screen.queryByRole('tooltip', { name: /tropical rainforest/i })).not.toBeInTheDocument();
  });

  it('shows and hides all climate classes', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /hide all/i }));

    expect(getCheckboxInputs().every((checkbox) => !checkbox.checked)).toBe(true);

    await user.click(screen.getByRole('button', { name: /show all/i }));

    expect(getCheckboxInputs().every((checkbox) => checkbox.checked)).toBe(true);
  });

  it('toggles individual climate classes', async () => {
    const user = userEvent.setup();

    render(<App />);

    const tropicalRainforestCheckbox = screen.getByRole('checkbox', {
      name: /Af tropical rainforest/i,
    });

    await user.click(tropicalRainforestCheckbox);

    expect(tropicalRainforestCheckbox).not.toBeChecked();

    await user.click(tropicalRainforestCheckbox);

    expect(tropicalRainforestCheckbox).toBeChecked();
  });

  it('filters classes without changing the tile URL', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<App />);
    const initialTileUrls = tileLayerProps.map((props) => props.data);

    await user.click(screen.getByRole('checkbox', { name: /Af tropical rainforest/i }));
    rerender(<App />);

    expect(screen.getByRole('checkbox', { name: /Af tropical rainforest/i })).not.toBeChecked();
    expect(
      tileLayerProps
        .map((props) => props.data)
        .filter((tileUrl) => (
          tileUrl === KOPPEN_COG_URL
        )),
    ).toHaveLength(2);
    expect(
      tileLayerProps
        .filter((props) => props.id === 'koppen-climate-tiles')
        .every((props) => (
          props.data === KOPPEN_COG_URL
        )),
    ).toBe(true);
    expect(new Set(tileLayerProps.map((props) => props.data))).toEqual(new Set(initialTileUrls));
    expect(tileLayerProps.at(-1)?.updateTriggers?.visibleClassIds).not.toBe(
      tileLayerProps[1]?.updateTriggers?.visibleClassIds,
    );
  });

  it('updates layer opacity without changing tile URLs', () => {
    const { rerender } = render(<App />);
    const initialTileUrls = tileLayerProps.map((props) => props.data);

    fireEvent.change(screen.getByRole('slider', { name: /map opacity/i }), {
      target: { value: '40' },
    });
    fireEvent.change(screen.getByRole('slider', { name: /köppen opacity/i }), {
      target: { value: '20' },
    });
    rerender(<App />);

    expect(screen.getByRole('slider', { name: /map opacity/i })).toHaveValue('40');
    expect(screen.getByRole('slider', { name: /köppen opacity/i })).toHaveValue('20');
    expect(tileLayerProps.at(-2)).toMatchObject({
      data: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      opacity: 0.4,
    });
    expect(tileLayerProps.at(-1)).toMatchObject({
      data: KOPPEN_COG_URL,
      opacity: 0.2,
    });
    expect(new Set(tileLayerProps.map((props) => props.data))).toEqual(new Set(initialTileUrls));
  });
});
