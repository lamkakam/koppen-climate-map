import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { App } from './App';

type TileLayerProps = {
  readonly data?: string;
  readonly updateTriggers?: {
    readonly visibleClassIds?: string;
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
    tileLayerProps.length = 0;
  });

  it('renders the fullscreen climate map and controls', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /koppen climate raster map/i })).toBeVisible();
    expect(screen.getByRole('group', { name: /koppen climate classes/i })).toBeVisible();
  });

  it('renders every Koppen class checkbox', () => {
    render(<App />);

    expect(screen.getAllByRole('checkbox')).toHaveLength(30);
    expect(screen.getByRole('checkbox', { name: /Af tropical rainforest/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /EF ice cap/i })).toBeChecked();
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
        .every((tileUrl) => tileUrl === '/tiles/koppen/1991_2020/{z}/{x}/{y}.png'),
    ).toBe(true);
    expect(new Set(tileLayerProps.map((props) => props.data))).toEqual(new Set(initialTileUrls));
    expect(tileLayerProps.at(-1)?.updateTriggers?.visibleClassIds).not.toBe(
      tileLayerProps.at(0)?.updateTriggers?.visibleClassIds,
    );
  });
});
