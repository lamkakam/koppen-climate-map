import type { Config } from 'tailwindcss';

import { climateTheme } from './src/shared/styles/theme';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: climateTheme.colors,
      boxShadow: climateTheme.shadows,
      transitionTimingFunction: climateTheme.motion.easing,
    },
  },
  plugins: [],
} satisfies Config;
