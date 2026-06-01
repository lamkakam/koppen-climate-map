export type KoppenClass = {
  readonly id: number;
  readonly code: string;
  readonly label: string;
  readonly color: readonly [number, number, number];
};

export const koppenClasses = [
  {
    id: 1, code: 'Af', label: 'Tropical rainforest', color: [0, 0, 255]
  },
  {
    id: 2, code: 'Am', label: 'Tropical monsoon', color: [0, 120, 255]
  },
  {
    id: 3, code: 'Aw', label: 'Tropical savanna', color: [70, 170, 250]
  },
  {
    id: 4, code: 'BWh', label: 'Hot desert', color: [255, 0, 0]
  },
  {
    id: 5, code: 'BWk', label: 'Cold desert', color: [255, 150, 150]
  },
  {
    id: 6, code: 'BSh', label: 'Hot semi-arid', color: [245, 165, 0]
  },
  {
    id: 7, code: 'BSk', label: 'Cold semi-arid', color: [255, 220, 100]
  },
  {
    id: 8, code: 'Csa', label: 'Hot-summer Mediterranean', color: [255, 255, 0]
  },
  {
    id: 9, code: 'Csb', label: 'Warm-summer Mediterranean', color: [200, 200, 0]
  },
  {
    id: 10, code: 'Csc', label: 'Cold-summer Mediterranean', color: [150, 150, 0]
  },
  {
    id: 11, code: 'Cwa', label: 'Monsoon humid subtropical', color: [150, 255, 150]
  },
  {
    id: 12, code: 'Cwb', label: 'Subtropical highland', color: [100, 200, 100]
  },
  {
    id: 13, code: 'Cwc', label: 'Cold subtropical highland', color: [50, 150, 50]
  },
  {
    id: 14, code: 'Cfa', label: 'Humid subtropical', color: [200, 255, 80]
  },
  {
    id: 15, code: 'Cfb', label: 'Temperate oceanic', color: [100, 255, 80]
  },
  {
    id: 16, code: 'Cfc', label: 'Subpolar oceanic', color: [50, 200, 0]
  },
  {
    id: 17, code: 'Dsa', label: 'Hot-summer humid continental', color: [255, 0, 255]
  },
  {
    id: 18, code: 'Dsb', label: 'Warm-summer humid continental', color: [200, 0, 200]
  },
  {
    id: 19, code: 'Dsc', label: 'Subarctic dry summer', color: [150, 50, 150]
  },
  {
    id: 20, code: 'Dsd', label: 'Extremely cold subarctic dry summer', color: [150, 100, 150]
  },
  {
    id: 21, code: 'Dwa', label: 'Monsoon hot-summer continental', color: [170, 175, 255]
  },
  {
    id: 22, code: 'Dwb', label: 'Monsoon warm-summer continental', color: [90, 120, 220]
  },
  {
    id: 23, code: 'Dwc', label: 'Monsoon subarctic', color: [75, 80, 180]
  },
  {
    id: 24, code: 'Dwd', label: 'Extremely cold monsoon subarctic', color: [50, 0, 135]
  },
  {
    id: 25, code: 'Dfa', label: 'Hot-summer continental', color: [0, 255, 255]
  },
  {
    id: 26, code: 'Dfb', label: 'Warm-summer continental', color: [55, 200, 255]
  },
  {
    id: 27, code: 'Dfc', label: 'Subarctic', color: [0, 125, 125]
  },
  {
    id: 28, code: 'Dfd', label: 'Extremely cold subarctic', color: [0, 70, 95]
  },
  {
    id: 29, code: 'ET', label: 'Tundra', color: [178, 178, 178]
  },
  {
    id: 30, code: 'EF', label: 'Ice cap', color: [102, 102, 102]
  },
] as const satisfies readonly KoppenClass[];

export const koppenClassIds = koppenClasses.map((koppenClass) => koppenClass.id);
