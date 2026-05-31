export const climateTheme = {
  colors: {
    canopy: {
      50: '#f4fbf6',
      100: '#def3e4',
      500: '#27734f',
      700: '#185139',
      900: '#0f3327',
    },
    water: {
      100: '#dff3fb',
      500: '#2f6fda',
      700: '#214f9c',
    },
    terrain: {
      100: '#f2e4c7',
      500: '#a9782f',
    },
    ember: {
      100: '#fee5d4',
      500: '#d85a2c',
    },
  },
  shadows: {
    panel: '0 18px 40px rgb(15 51 39 / 0.12)',
  },
  motion: {
    easing: {
      standard: 'cubic-bezier(0.2, 0, 0, 1)',
    },
  },
} as const;
