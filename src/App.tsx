import { ClimateMapDashboard } from './features/climate-map/components';
import { AppShell } from './shared/components/layout';

export function App() {
  return (
    <AppShell>
      <ClimateMapDashboard />
    </AppShell>
  );
}
