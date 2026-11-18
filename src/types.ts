import { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { presets, slides } from './animation-presets';
import { namedEasings } from './utils';

type AnimationStyle = TextStyle &
  ViewStyle &
  ImageStyle & {
    perspective?: number;
    rotate?: string;
    rotateX?: string;
    rotateY?: string;
    rotateZ?: string;
    scale?: number;
    scaleX?: number;
    scaleY?: number;
    skewX?: string;
    skewY?: string;
    translateX?: number;
    translateY?: number;
  };

export interface CustomAnimation {
  from?: AnimationStyle;
  to?: AnimationStyle;
  style?: AnimationStyle;
  easing?: keyof typeof namedEasings | ((progress: number) => number);
  [progress: number]: AnimationStyle;
}

export type Animation = keyof typeof presets | keyof typeof slides;
export type SupportedAnimation = Animation | CustomAnimation;

export type Animations = {
  animationIn: string;
  animationOut: string;
};

export type Orientation = NonNullable<
  import('react-native').ModalProps['supportedOrientations']
>[number];
export type PresentationStyle = NonNullable<
  import('react-native').ModalProps['presentationStyle']
>;
export type OnOrientationChange = NonNullable<
  import('react-native').ModalProps['onOrientationChange']
>;
