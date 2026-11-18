import { Easing, processColor, StyleSheet, ViewStyle } from 'react-native';
import { interpolate, interpolateColor } from 'react-native-reanimated';
import { presets, slides } from './animation-presets';
import { CustomAnimation, SupportedAnimation } from './types';

export const namedEasings = {
  // Standard CSS easings

  linear: Easing.linear,
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),
  'ease-in': Easing.bezier(0.42, 0, 1, 1),
  'ease-out': Easing.bezier(0, 0, 0.58, 1),
  'ease-in-out': Easing.bezier(0.42, 0, 0.58, 1),

  // Penner Equations - http://matthewlein.com/ceaser/ & http://easings.net

  'ease-in-cubic': Easing.bezier(0.55, 0.055, 0.675, 0.19),
  'ease-out-cubic': Easing.bezier(0.215, 0.61, 0.355, 1.0),
  'ease-in-out-cubic': Easing.bezier(0.645, 0.045, 0.355, 1.0),

  'ease-in-circ': Easing.bezier(0.6, 0.04, 0.98, 0.335),
  'ease-out-circ': Easing.bezier(0.075, 0.82, 0.165, 1.0),
  'ease-in-out-circ': Easing.bezier(0.785, 0.135, 0.15, 0.86),

  'ease-in-expo': Easing.bezier(0.95, 0.05, 0.795, 0.035),
  'ease-out-expo': Easing.bezier(0.19, 1.0, 0.22, 1.0),
  'ease-in-out-expo': Easing.bezier(1.0, 0.0, 0.0, 1.0),

  'ease-in-quad': Easing.bezier(0.55, 0.085, 0.68, 0.53),
  'ease-out-quad': Easing.bezier(0.25, 0.46, 0.45, 0.94),
  'ease-in-out-quad': Easing.bezier(0.455, 0.03, 0.515, 0.955),

  'ease-in-quart': Easing.bezier(0.895, 0.03, 0.685, 0.22),
  'ease-out-quart': Easing.bezier(0.165, 0.84, 0.44, 1.0),
  'ease-in-out-quart': Easing.bezier(0.77, 0.0, 0.175, 1.0),

  'ease-in-quint': Easing.bezier(0.755, 0.05, 0.855, 0.06),
  'ease-out-quint': Easing.bezier(0.23, 1.0, 0.32, 1.0),
  'ease-in-out-quint': Easing.bezier(0.86, 0.0, 0.07, 1.0),

  'ease-in-sine': Easing.bezier(0.47, 0.0, 0.745, 0.715),
  'ease-out-sine': Easing.bezier(0.39, 0.575, 0.565, 1.0),
  'ease-in-out-sine': Easing.bezier(0.445, 0.05, 0.55, 0.95),

  'ease-in-back': Easing.bezier(0.6, -0.28, 0.735, 0.045),
  'ease-out-back': Easing.bezier(0.175, 0.885, 0.32, 1.275),
  'ease-in-out-back': Easing.bezier(0.68, -0.55, 0.265, 1.55),
};

const transformKeys = new Set([
  'perspective',
  'rotate',
  'rotateX',
  'rotateY',
  'rotateZ',
  'scale',
  'scaleX',
  'scaleY',
  'skewX',
  'skewY',
  'translateX',
  'translateY',
  'matrix',
]);

type StyleValue = Record<string, unknown>;
type Track = {
  property: string;
  positions: number[];
  values: unknown[];
  numbers: number[] | undefined;
  unit: string;
  isColor: boolean;
};

export type PreparedAnimation = {
  style: StyleValue;
  transforms: StyleValue;
  tracks: Track[];
  easing: number[];
};

const easingPositions = Array.from({ length: 101 }, (_, index) => index / 100);
const defaultEasing = easingPositions.map(namedEasings.ease);
const numberWithUnit =
  /^(-?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?)(deg|rad|%)?$/i;

function flattenStyle(style: CustomAnimation['style']): StyleValue {
  const { transform, ...properties } = StyleSheet.flatten(style) ?? {};
  return {
    ...properties,
    ...Object.assign({}, ...(Array.isArray(transform) ? transform : [])),
  };
}

export function prepareAnimation(
  animation: SupportedAnimation,
  width: number,
  height: number,
): PreparedAnimation {
  let definition: CustomAnimation;
  if (typeof animation !== 'string') {
    definition = animation;
  } else if (Object.prototype.hasOwnProperty.call(slides, animation)) {
    const [axis, direction, entering] =
      slides[animation as keyof typeof slides];
    const offset = direction * (axis === 'translateY' ? height : width);
    definition = {
      from: { [axis]: entering ? offset : 0 },
      to: { [axis]: entering ? 0 : offset },
    };
  } else if (Object.prototype.hasOwnProperty.call(presets, animation)) {
    definition = presets[animation as keyof typeof presets];
  } else {
    throw new Error(`Unknown modal animation: ${animation}`);
  }

  const frames = Object.keys(definition)
    .filter((key) => key !== 'style' && key !== 'easing')
    .map((key) => (key === 'from' ? 0 : key === 'to' ? 1 : Number(key)))
    .filter((position) => position >= 0 && position <= 1);
  const positions = [...new Set(frames)].sort((a, b) => a - b);
  if (positions.length < 2) {
    throw new Error('Modal animations require at least two keyframes.');
  }

  const style: StyleValue = {};
  const transforms: StyleValue = {};
  const definitionStyle = flattenStyle(definition.style);
  for (const key of Object.keys(definitionStyle)) {
    (transformKeys.has(key) ? transforms : style)[key] = definitionStyle[key];
  }

  const properties = new Map<
    string,
    { positions: number[]; values: unknown[] }
  >();
  for (const position of positions) {
    const frame =
      definition[position] ??
      (position === 0 ? definition.from : definition.to);
    const frameStyle = flattenStyle(frame);
    for (const key of Object.keys(frameStyle)) {
      const track = properties.get(key) ?? { positions: [], values: [] };
      track.positions.push(position);
      track.values.push(frameStyle[key]);
      properties.set(key, track);
    }
  }

  const tracks = Array.from(properties, ([key, track]) => {
    const parts = track.values.map((value) =>
      numberWithUnit.exec(String(value)),
    );
    const unit = parts[0]?.[2] ?? '';
    const numeric = parts.every((part) => part && (part[2] ?? '') === unit);
    const isColor =
      /color$/i.test(key) &&
      track.values.every(
        (value) => typeof value === 'string' && processColor(value) != null,
      );
    // Reserve each transform's position before evaluating its animated value.
    if (transformKeys.has(key) && !(key in transforms)) {
      transforms[key] = track.values[0];
    }
    return {
      property: key,
      ...track,
      numbers: numeric ? parts.map((part) => Number(part![1])) : undefined,
      unit,
      isColor,
    };
  });

  const easing =
    typeof definition.easing === 'function'
      ? definition.easing
      : definition.easing && namedEasings[definition.easing];
  return {
    style,
    transforms,
    tracks,
    easing: easing
      ? easingPositions.map((position) => easing(position))
      : defaultEasing,
  };
}

export function animationStyle(
  { style, transforms, tracks, easing }: PreparedAnimation,
  progress: number,
): ViewStyle {
  'worklet';
  // All easing curves use evenly spaced samples, including plain JS callbacks.
  const sample = Math.min(100, Math.max(0, progress * 100));
  const index = Math.floor(sample);
  const start = easing[index] ?? sample / 100;
  const end = easing[Math.min(index + 1, 100)] ?? start;
  const eased = start + (sample - index) * (end - start);
  const result = { ...style };
  const animatedTransforms = { ...transforms };
  for (const track of tracks) {
    const { property, positions, values, numbers, unit, isColor } = track;
    let value = values[0];
    if (values.length > 1) {
      if (numbers) {
        const interpolated = interpolate(eased, positions, numbers);
        value = unit ? `${interpolated}${unit}` : interpolated;
      } else if (isColor) {
        value = interpolateColor(eased, positions, values as string[]);
      } else {
        const last = positions.findIndex((position) => position > eased);
        value = values[last < 0 ? values.length - 1 : Math.max(0, last - 1)];
      }
    }
    (property in transforms ? animatedTransforms : result)[property] = value;
  }
  const transform = Object.keys(animatedTransforms).map((property) => ({
    [property]: animatedTransforms[property],
  }));
  if (transform.length) {
    result['transform'] = transform;
  }
  return result as ViewStyle;
}
