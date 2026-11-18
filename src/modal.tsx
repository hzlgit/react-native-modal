import * as React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  ModalProps as NativeModalProps,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  runOnUI,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import styles from './modal.style';
import { BackHandler } from './back-handler.js';
import { animationStyle, prepareAnimation, PreparedAnimation } from './utils';
import { Orientation, SupportedAnimation } from './types';

const noop = () => {};
const keyboardBehavior = Platform.select({
  android: 'height',
  ios: 'padding',
} as const);

const defaultProps = {
  animationIn: 'slideInUp' as SupportedAnimation,
  animationInTiming: 300,
  animationOut: 'slideOutDown' as SupportedAnimation,
  animationOutTiming: 300,
  avoidKeyboard: false,
  coverScreen: true,
  hasBackdrop: true,
  backdropColor: 'black',
  backdropOpacity: 0.7,
  backdropTransitionInTiming: 300,
  backdropTransitionOutTiming: 300,
  customBackdrop: null as React.ReactNode,
  deviceHeight: null as number | null,
  deviceWidth: null as number | null,
  hideModalContentWhileAnimating: false,
  isVisible: false,
  onModalShow: noop,
  onModalWillShow: noop,
  onModalHide: noop,
  onModalWillHide: noop,
  onBackdropPress: noop,
  onBackButtonPress: noop,
  statusBarTranslucent: false,
  supportedOrientations: ['portrait', 'landscape'] as Orientation[],
};

export type ModalProps = ViewProps &
  Pick<
    NativeModalProps,
    | 'hardwareAccelerated'
    | 'onDismiss'
    | 'onOrientationChange'
    | 'onShow'
    | 'presentationStyle'
  > & {
    children: React.ReactNode;
  } & Partial<typeof defaultProps>;

type ContentProps = ViewProps & {
  animation: SharedValue<ContentAnimation | null>;
  progress: SharedValue<number>;
};

type ContentAnimation = PreparedAnimation & { properties: string[] };

function Content({ animation, progress, style, ...props }: ContentProps) {
  const flattenedStyle = StyleSheet.flatten(style);
  const base: Record<string, unknown> = {
    ...flattenedStyle,
    opacity: flattenedStyle?.opacity ?? 1,
    transform: flattenedStyle?.transform ?? [],
  };
  const animatedStyle = useAnimatedStyle(() => {
    const current = animation.value;
    if (!current) {
      return { opacity: 0 };
    }
    const values: Record<string, unknown> = {};
    for (const property of current.properties) {
      values[property] = base[property];
    }
    return { ...values, ...animationStyle(current, progress.value) };
  });

  // Reanimated retains the last value of an animated property when the next
  // animation omits it. Apply the base styles as a fallback on every frame.
  return <Animated.View {...props} style={[style, animatedStyle]} />;
}

type BackdropProps = ViewProps & { opacity: SharedValue<number> };

function Backdrop({ opacity, style, ...props }: BackdropProps) {
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View {...props} style={[style, animatedStyle]} />;
}

type Phase = 'hidden' | 'opening' | 'shown' | 'closing';

type TransitionOptions = Pick<
  typeof defaultProps,
  | 'animationIn'
  | 'animationInTiming'
  | 'animationOut'
  | 'animationOutTiming'
  | 'backdropOpacity'
  | 'backdropTransitionInTiming'
  | 'backdropTransitionOutTiming'
  | 'hasBackdrop'
  | 'isVisible'
  | 'onModalWillShow'
  | 'onModalShow'
  | 'onModalWillHide'
  | 'onModalHide'
> & { width: number; height: number };

function useModalTransition(options: TransitionOptions) {
  const [phase, setPhase] = React.useState<Phase>(() =>
    options.isVisible ? 'opening' : 'hidden',
  );
  const latest = React.useRef(options);
  const previousPhase = React.useRef(phase);
  const transitionId = React.useRef(0);
  const completed = React.useRef<'opening' | 'closing' | null>(null);
  const contentProperties = React.useRef(new Set(['opacity']));
  const contentProgress = useSharedValue(0);
  const contentAnimation = useSharedValue<ContentAnimation | null>(null);
  const animatedOpacity = useSharedValue(0);

  React.useLayoutEffect(() => {
    const previous = latest.current;
    const wasOpening = previousPhase.current === 'opening';
    latest.current = options;
    previousPhase.current = phase;

    if (
      options.isVisible &&
      options.hasBackdrop &&
      (phase === 'shown' || (phase === 'opening' && wasOpening)) &&
      (!previous.hasBackdrop ||
        previous.backdropOpacity !== options.backdropOpacity)
    ) {
      animatedOpacity.value = withTiming(options.backdropOpacity, {
        duration: options.backdropTransitionInTiming,
      });
    }
  });

  React.useLayoutEffect(
    () => () => {
      transitionId.current += 1;
      cancelAnimation(contentProgress);
      cancelAnimation(animatedOpacity);
    },
    [contentProgress, animatedOpacity],
  );

  const { isVisible } = options;
  React.useLayoutEffect(() => {
    if (phase === 'hidden' || phase === 'shown') {
      const completion = completed.current;
      completed.current = null;

      if (isVisible !== (phase === 'shown')) {
        setPhase(isVisible ? 'opening' : 'closing');
      } else if (completion === 'opening') {
        latest.current.onModalShow();
      } else if (completion === 'closing') {
        latest.current.onModalHide();
      }
    }
  }, [phase, isVisible]);

  React.useLayoutEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') {
      return;
    }

    const opening = phase === 'opening';
    const config = latest.current;
    const prepared = prepareAnimation(
      opening ? config.animationIn : config.animationOut,
      config.width,
      config.height,
    );
    const properties = contentProperties.current;
    for (const property of Object.keys(prepared.style)) {
      properties.add(property);
    }
    for (const { property } of prepared.tracks) {
      if (!(property in prepared.transforms)) {
        properties.add(property);
      }
    }
    if (Object.keys(prepared.transforms).length) {
      properties.add('transform');
    }

    const animation = { ...prepared, properties: [...properties] };
    const duration = opening
      ? config.animationInTiming
      : config.animationOutTiming;
    const backdropDuration = opening
      ? config.backdropTransitionInTiming
      : config.backdropTransitionOutTiming;
    const opacity = opening && config.hasBackdrop ? config.backdropOpacity : 0;
    const waitForBackdrop = !opening && config.hasBackdrop;
    const id = ++transitionId.current;
    let animationsRemaining = waitForBackdrop ? 2 : 1;

    const finish = () => {
      animationsRemaining -= 1;
      if (animationsRemaining !== 0 || id !== transitionId.current) {
        return;
      }

      // A visibility change during a transition takes effect once it finishes.
      if (opening !== latest.current.isVisible) {
        setPhase(opening ? 'closing' : 'opening');
        return;
      }

      completed.current = phase;
      if (!opening) {
        contentAnimation.value = null;
      }
      setPhase(opening ? 'shown' : 'hidden');
    };

    (opening ? config.onModalWillShow : config.onModalWillHide)();

    // Apply the first frame and reset progress together on the UI thread.
    runOnUI(() => {
      'worklet';
      contentAnimation.value = animation;
      contentProgress.value = 0;
      contentProgress.value = withTiming(
        1,
        { duration, easing: Easing.linear },
        (finished) => {
          if (finished) {
            runOnJS(finish)();
          }
        },
      );
      animatedOpacity.value = withTiming(
        opacity,
        { duration: backdropDuration },
        (finished) => {
          if (finished && waitForBackdrop) {
            runOnJS(finish)();
          }
        },
      );
    })();
  }, [phase, contentAnimation, contentProgress, animatedOpacity]);

  return {
    mounted: phase !== 'hidden' || isVisible,
    showContent: phase === 'shown',
    contentAnimation,
    contentProgress,
    animatedOpacity,
  };
}

export function ReactNativeModal({
  animationIn = defaultProps.animationIn,
  animationInTiming = defaultProps.animationInTiming,
  animationOut = defaultProps.animationOut,
  animationOutTiming = defaultProps.animationOutTiming,
  avoidKeyboard = defaultProps.avoidKeyboard,
  coverScreen = defaultProps.coverScreen,
  hasBackdrop = defaultProps.hasBackdrop,
  backdropColor = defaultProps.backdropColor,
  backdropOpacity = defaultProps.backdropOpacity,
  backdropTransitionInTiming = defaultProps.backdropTransitionInTiming,
  backdropTransitionOutTiming = defaultProps.backdropTransitionOutTiming,
  customBackdrop = defaultProps.customBackdrop,
  deviceHeight = defaultProps.deviceHeight,
  deviceWidth = defaultProps.deviceWidth,
  hideModalContentWhileAnimating = defaultProps.hideModalContentWhileAnimating,
  isVisible = defaultProps.isVisible,
  onModalShow = defaultProps.onModalShow,
  onModalWillShow = defaultProps.onModalWillShow,
  onModalHide = defaultProps.onModalHide,
  onModalWillHide = defaultProps.onModalWillHide,
  onBackdropPress = defaultProps.onBackdropPress,
  onBackButtonPress = defaultProps.onBackButtonPress,
  statusBarTranslucent = defaultProps.statusBarTranslucent,
  supportedOrientations = defaultProps.supportedOrientations,
  hardwareAccelerated,
  onDismiss,
  onOrientationChange,
  onShow,
  presentationStyle,
  testID,
  style,
  children,
  ...viewProps
}: ModalProps) {
  const window = useWindowDimensions();
  const width = deviceWidth ?? window.width;
  const height = deviceHeight ?? window.height;
  const {
    mounted,
    showContent,
    contentAnimation,
    contentProgress,
    animatedOpacity,
  } = useModalTransition({
    animationIn,
    animationInTiming,
    animationOut,
    animationOutTiming,
    backdropOpacity,
    backdropTransitionInTiming,
    backdropTransitionOutTiming,
    hasBackdrop,
    isVisible,
    onModalShow,
    onModalWillShow,
    onModalHide,
    onModalWillHide,
    width,
    height,
  });

  const backPress = React.useRef({ isVisible, onBackButtonPress });
  React.useLayoutEffect(() => {
    backPress.current = { isVisible, onBackButtonPress };
  }, [isVisible, onBackButtonPress]);

  const handleBackPress = React.useCallback(() => {
    if (backPress.current.isVisible) {
      backPress.current.onBackButtonPress();
      return true;
    }
    return false;
  }, []);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );
    return () => subscription.remove();
  }, [handleBackPress]);

  if (!coverScreen && !mounted) {
    return null;
  }

  const content = (
    <Content
      pointerEvents="box-none"
      {...viewProps}
      animation={contentAnimation}
      progress={contentProgress}
      style={[{ margin: width * 0.05 }, styles.content, style]}
    >
      {hideModalContentWhileAnimating && !showContent ? null : children}
    </Content>
  );

  let backdrop: React.ReactNode = null;
  if (hasBackdrop) {
    if (customBackdrop && !React.isValidElement(customBackdrop)) {
      console.warn(
        'Invalid customBackdrop element passed to Modal. You must provide a valid React element.',
      );
    }

    const backdropView = (
      <Backdrop
        opacity={animatedOpacity}
        style={[
          styles.backdrop,
          {
            width,
            height,
            backgroundColor: customBackdrop ? 'transparent' : backdropColor,
          },
        ]}
      >
        {customBackdrop}
      </Backdrop>
    );
    backdrop = customBackdrop ? (
      backdropView
    ) : (
      <TouchableWithoutFeedback onPress={onBackdropPress}>
        {backdropView}
      </TouchableWithoutFeedback>
    );
  }

  if (!coverScreen) {
    return (
      <View
        testID={testID}
        pointerEvents="box-none"
        style={[styles.backdrop, styles.containerBox]}
      >
        {backdrop}
        {content}
      </View>
    );
  }

  return (
    <Modal
      testID={testID}
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={() => {
        handleBackPress();
      }}
      statusBarTranslucent={statusBarTranslucent}
      supportedOrientations={supportedOrientations}
      hardwareAccelerated={hardwareAccelerated}
      onDismiss={onDismiss}
      onOrientationChange={onOrientationChange}
      onShow={onShow}
      presentationStyle={presentationStyle}
    >
      {backdrop}
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior={keyboardBehavior}
          pointerEvents="box-none"
          style={styles.content}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

export default ReactNativeModal;
