import { Platform } from 'react-native';

type BackHandlerSubscription = Pick<
  typeof import('react-native').BackHandler,
  'addEventListener'
>;

export const BackHandler: BackHandlerSubscription =
  Platform.OS === 'web'
    ? { addEventListener: () => ({ remove() {} }) }
    : require('react-native').BackHandler;
