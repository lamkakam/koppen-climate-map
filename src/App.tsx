import { useEffect, useState } from 'react';

import { ClimateMapDashboard } from './features/climate-map/components';
import { AppShell } from './shared/components/layout';
import { Modal } from './shared/components/primitives';

const dataLicenseNoticeStorageKey = 'koppenClimateMap.dataLicenseNoticeDismissed';

export function App() {
  const [isDataLicenseNoticeOpen, setIsDataLicenseNoticeOpen] = useState(
    () => window.localStorage.getItem(dataLicenseNoticeStorageKey) !== 'true',
  );

  useEffect(() => {
    document.title = 'Köppen Climate Map';
  }, []);

  function acknowledgeDataLicenseNotice() {
    window.localStorage.setItem(dataLicenseNoticeStorageKey, 'true');
    setIsDataLicenseNoticeOpen(false);
  }

  return (
    <>
      {isDataLicenseNoticeOpen ? (
        <Modal
          footer={(
            <button
              aria-label="Acknowledge data license notice"
              className="min-h-10 rounded-md bg-canopy-700 px-4 text-sm font-semibold text-white transition-colors duration-200 ease-standard hover:bg-canopy-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canopy-700"
              onClick={acknowledgeDataLicenseNotice}
              type="button"
            >
              I understand
            </button>
          )}
          title="Data license and attribution"
        >
          <p>
            The data are provided under the Creative Commons Attribution 4.0
            International license (
            <a
              className="font-semibold text-water-700 underline decoration-water-700/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-700"
              href="https://creativecommons.org/licenses/by/4.0/"
            >
              CC BY 4.0
            </a>
            ).
          </p>
          <p>
            The data may be freely used, adapted, and shared, including
            commercial and non-commercial use, with attribution.
          </p>
          <p>
            Beck, H.E., T.R. McVicar, N. Vergopolan, A. Berg, N.J. Lutsko, A.
            Dufour, Z. Zeng, X. Jiang, A.I.J.M. van Dijk, D.G. Miralles.
            {' '}
            <a
              className="font-semibold text-water-700 underline decoration-water-700/40 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-water-700"
              href="https://www.nature.com/articles/s41597-023-02549-6"
            >
              High-resolution (1 km) Köppen-Geiger maps for 1901-2099 based on
              constrained CMIP6 projections
            </a>
            . Scientific Data 10, 724, doi:10.1038/s41597-023-02549-6 (2023).
          </p>
        </Modal>
      ) : undefined}
      <AppShell>
        <ClimateMapDashboard />
      </AppShell>
    </>
  );
}
