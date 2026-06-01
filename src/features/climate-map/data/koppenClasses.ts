export type KoppenClass = {
  readonly id: number;
  readonly code: string;
  readonly label: string;
  readonly color: readonly [number, number, number];
};

export const koppenClasses = [
  {
 id: 1, code: 'Af', label: 'Tropical rainforest', color: [0, 104, 55]
},
  {
 id: 2, code: 'Am', label: 'Tropical monsoon', color: [26, 152, 80]
},
  {
 id: 3, code: 'Aw', label: 'Tropical savanna', color: [102, 189, 99]
},
  {
 id: 4, code: 'BWh', label: 'Hot desert', color: [215, 48, 39]
},
  {
 id: 5, code: 'BWk', label: 'Cold desert', color: [244, 109, 67]
},
  {
 id: 6, code: 'BSh', label: 'Hot semi-arid', color: [253, 174, 97]
},
  {
 id: 7, code: 'BSk', label: 'Cold semi-arid', color: [254, 224, 139]
},
  {
 id: 8, code: 'Csa', label: 'Hot-summer Mediterranean', color: [255, 255, 191]
},
  {
 id: 9, code: 'Csb', label: 'Warm-summer Mediterranean', color: [217, 239, 139]
},
  {
 id: 10, code: 'Csc', label: 'Cold-summer Mediterranean', color: [166, 217, 106]
},
  {
 id: 11, code: 'Cwa', label: 'Monsoon humid subtropical', color: [102, 194, 165]
},
  {
 id: 12, code: 'Cwb', label: 'Subtropical highland', color: [50, 136, 189]
},
  {
 id: 13, code: 'Cwc', label: 'Cold subtropical highland', color: [94, 79, 162]
},
  {
 id: 14, code: 'Cfa', label: 'Humid subtropical', color: [141, 211, 199]
},
  {
 id: 15, code: 'Cfb', label: 'Temperate oceanic', color: [190, 186, 218]
},
  {
 id: 16, code: 'Cfc', label: 'Subpolar oceanic', color: [128, 177, 211]
},
  {
 id: 17, code: 'Dsa', label: 'Hot-summer humid continental', color: [251, 128, 114]
},
  {
 id: 18, code: 'Dsb', label: 'Warm-summer humid continental', color: [128, 128, 128]
},
  {
 id: 19, code: 'Dsc', label: 'Subarctic dry summer', color: [179, 222, 105]
},
  {
 id: 20, code: 'Dsd', label: 'Extremely cold subarctic dry summer', color: [252, 205, 229]
},
  {
 id: 21, code: 'Dwa', label: 'Monsoon hot-summer continental', color: [188, 128, 189]
},
  {
 id: 22, code: 'Dwb', label: 'Monsoon warm-summer continental', color: [204, 235, 197]
},
  {
 id: 23, code: 'Dwc', label: 'Monsoon subarctic', color: [255, 237, 111]
},
  {
 id: 24, code: 'Dwd', label: 'Extremely cold monsoon subarctic', color: [31, 120, 180]
},
  {
 id: 25, code: 'Dfa', label: 'Hot-summer continental', color: [178, 223, 138]
},
  {
 id: 26, code: 'Dfb', label: 'Warm-summer continental', color: [51, 160, 44]
},
  {
 id: 27, code: 'Dfc', label: 'Subarctic', color: [251, 154, 153]
},
  {
 id: 28, code: 'Dfd', label: 'Extremely cold subarctic', color: [227, 26, 28]
},
  {
 id: 29, code: 'ET', label: 'Tundra', color: [166, 206, 227]
},
  {
 id: 30, code: 'EF', label: 'Ice cap', color: [247, 247, 247]
},
] as const satisfies readonly KoppenClass[];

export const koppenClassIds = koppenClasses.map((koppenClass) => koppenClass.id);
