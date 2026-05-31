import { BitmapLayer } from '@deck.gl/layers';
import type { BitmapLayerProps } from '@deck.gl/layers';

import { koppenClasses } from '../data/koppenClasses';

type KoppenBitmapLayerExtraProps = {
  readonly visibleClassIds: readonly number[];
  readonly koppenOpacity: number;
};

type ShaderMap = {
  readonly modules?: readonly unknown[];
  readonly inject?: Readonly<Record<string, string>>;
};

const uniformNames = koppenClasses.flatMap((koppenClass) => [
  `  vec4 color${koppenClass.id};`,
  `  float visible${koppenClass.id};`,
]);

const koppenUniforms = {
  name: 'koppen',
  fs: `\
layout(std140) uniform koppenUniforms {
  float opacity;
${uniformNames.join('\n')}
} koppen;
`,
  uniformTypes: Object.fromEntries([
    ['opacity', 'f32'],
    ...koppenClasses.flatMap((koppenClass) => [
      [`color${koppenClass.id}`, 'vec4<f32>'],
      [`visible${koppenClass.id}`, 'f32'],
    ]),
  ]),
};

const classBranches = koppenClasses
  .map(
    (koppenClass) => `\
  if (classId == ${koppenClass.id}) {
    if (koppen.visible${koppenClass.id} < 0.5) {
      discard;
    }
    koppenColor = koppen.color${koppenClass.id};
  }`,
  )
  .join('\n');

const koppenColorFilter = `\
  int classId = int(floor(color.r * 255.0 + 0.5));
  if (classId == 0 || color.a <= 0.0) {
    discard;
  }

  vec4 koppenColor = vec4(0.0);
${classBranches}

  if (koppenColor.a <= 0.0) {
    discard;
  }

  color = vec4(koppenColor.rgb, color.a * koppen.opacity);
`;

function createKoppenUniformProps(visibleClassIds: readonly number[], koppenOpacity: number) {
  const visibleClassIdSet = new Set(visibleClassIds);

  return Object.fromEntries(
    [
      ['opacity', koppenOpacity],
      ...koppenClasses.flatMap((koppenClass) => {
        const [red, green, blue] = koppenClass.color;

        return [
          [`color${koppenClass.id}`, [red / 255, green / 255, blue / 255, 1]],
          [`visible${koppenClass.id}`, visibleClassIdSet.has(koppenClass.id) ? 1 : 0],
        ];
      }),
    ],
  );
}

export class KoppenBitmapLayer extends BitmapLayer<KoppenBitmapLayerExtraProps> {
  static layerName = 'KoppenBitmapLayer';

  getShaders() {
    const shaders = super.getShaders() as ShaderMap;

    return {
      ...shaders,
      modules: [...(shaders.modules ?? []), koppenUniforms],
      inject: {
        ...shaders.inject,
        'fs:DECKGL_FILTER_COLOR': koppenColorFilter,
      },
    };
  }

  draw(opts: Parameters<BitmapLayer<KoppenBitmapLayerExtraProps>['draw']>[0]): void {
    this.state.model?.shaderInputs.setProps({
      koppen: createKoppenUniformProps(this.props.visibleClassIds, this.props.koppenOpacity),
    });

    super.draw(opts);
  }
}

export type KoppenBitmapLayerProps = BitmapLayerProps & KoppenBitmapLayerExtraProps;
