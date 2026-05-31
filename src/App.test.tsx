import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { App } from './App';

describe('App', () => {
  it('renders the climate map workspace', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /koppen climate map/i })).toBeVisible();
  });

  it('toggles climate layer visibility', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /hide climate layers/i }));

    expect(screen.getByRole('button', { name: /show climate layers/i })).toBeVisible();
  });
});
