# @hjzl/react-native-modal

A Reanimated-based fork of [react-native-modal](https://github.com/react-native-modal/react-native-modal).

> React Native also offers a [<Modal /> component that works out-of-the-box](https://reactnative.dev/docs/modal).

An enhanced, animated, customizable React Native modal.

The goal of `react-native-modal` is expanding the original React Native `<Modal>` component by adding animations, style customization options, and new features, while still providing a simple API.

## Features

- Smooth enter/exit animations
- Plain simple and flexible APIs
- Customizable backdrop opacity, color and timing
- Listeners for the modal animations ending
- Resize itself correctly on device rotation

## Setup

Install the current prerelease and a compatible version of `react-native-reanimated` in your app.

```sh
npm install @hjzl/react-native-modal@next
```

Check the Reanimated compatibility table for your React Native version and architecture. This package accepts Reanimated 3.6 or later in the 3.x series, and Reanimated 4.x. [Reanimated 3 compatibility](https://docs.swmansion.com/react-native-reanimated/docs/3.x/guides/compatibility/) · [Reanimated 4 compatibility](https://docs.swmansion.com/react-native-reanimated/docs/guides/compatibility/)

For bare React Native, put the Reanimated 3 Babel plugin (`react-native-reanimated/plugin`) or the Reanimated 4 Worklets plugin (`react-native-worklets/plugin`) last in your Babel plugins. Reanimated 4 also requires a compatible version of `react-native-worklets`. Follow the installation guide for your setup, then rebuild the app. [Reanimated 3 setup](https://docs.swmansion.com/react-native-reanimated/docs/3.x/) · [Reanimated 4 setup](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/)

## Usage

Since `react-native-modal` is an extension of the [original React Native modal](https://reactnative.dev/docs/modal.html), it works in a similar fashion.

1.  Import the scoped package.

```javascript
import Modal from '@hjzl/react-native-modal';
```

2.  Create a `<Modal>` component and nest its content inside of it:

```javascript
function WrapperComponent() {
  return (
    <View>
      <Modal>
        <View style={{flex: 1}}>
          <Text>I am the modal content!</Text>
        </View>
      </Modal>
    </View>
  );
}
```

3.  Then, show the modal by setting the `isVisible` prop to `true`:

```javascript
function WrapperComponent() {
  return (
    <View>
      <Modal isVisible={true}>
        <View style={{flex: 1}}>
          <Text>I am the modal content!</Text>
        </View>
      </Modal>
    </View>
  );
}
```

The `isVisible` prop is the only prop you'll really need to make the modal work: you should control this prop value by saving it in your wrapper component state and setting it to `true` or `false` when needed.

## A complete example

The following example consists in a component (`ModalTester`) with a button and a modal.
The modal is controlled by the `isModalVisible` state variable and it is initially hidden, since its value is `false`.  
Pressing the button sets `isModalVisible` to true, making the modal visible.  
Inside the modal there is another button that, when pressed, sets `isModalVisible` to false, hiding the modal.

```javascript
import React, {useState} from 'react';
import {Button, Text, View} from 'react-native';
import Modal from '@hjzl/react-native-modal';

function ModalTester() {
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <View style={{flex: 1}}>
      <Button title="Show modal" onPress={toggleModal} />

      <Modal isVisible={isModalVisible}>
        <View style={{flex: 1}}>
          <Text>Hello!</Text>

          <Button title="Hide modal" onPress={toggleModal} />
        </View>
      </Modal>
    </View>
  );
}

export default ModalTester;
```

See the [bare React Native example](./examples/bare) for a runnable app.

## Available props

| Name                             | Type                 | Default                          | Description                                                                                                                                |
| -------------------------------- | -------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `animationIn`                    | `string` or `object` | `"slideInUp"`                    | Modal show animation                                                                                                                       |
| `animationInTiming`              | `number`             | `300`                            | Timing for the modal show animation (in ms)                                                                                                |
| `animationOut`                   | `string` or `object` | `"slideOutDown"`                 | Modal hide animation                                                                                                                       |
| `animationOutTiming`             | `number`             | `300`                            | Timing for the modal hide animation (in ms)                                                                                                |
| `avoidKeyboard`                  | `bool`               | `false`                          | Move the modal up if the keyboard is open                                                                                                  |
| `coverScreen`                    | `bool`               | `true`                           | Will use RN `Modal` component to cover the entire screen wherever the modal is mounted in the component hierarchy                          |
| `hasBackdrop`                    | `bool`               | `true`                           | Render the backdrop                                                                                                                        |
| `backdropColor`                  | `string`             | `"black"`                        | The backdrop background color                                                                                                              |
| `backdropOpacity`                | `number`             | `0.70`                           | The backdrop opacity when the modal is visible                                                                                             |
| `backdropTransitionInTiming`     | `number`             | `300`                            | The backdrop show timing (in ms)                                                                                                           |
| `backdropTransitionOutTiming`    | `number`             | `300`                            | The backdrop hide timing (in ms)                                                                                                           |
| `customBackdrop`                 | `node`               | `null`                           | The custom backdrop element                                                                                                                |
| `children`                       | `node`               | **REQUIRED**                     | The modal content                                                                                                                          |
| `deviceHeight`                   | `number`             | `null`                           | Device height (useful on devices that can hide the navigation bar)                                                                         |
| `deviceWidth`                    | `number`             | `null`                           | Device width (useful on devices that can hide the navigation bar)                                                                          |
| `isVisible`                      | `bool`               | `false`                          | Show the modal?                                                                                                                            |
| `onBackButtonPress`              | `func`               | `() => null`                     | Called when the Android back button is pressed                                                                                             |
| `onBackdropPress`                | `func`               | `() => null`                     | Called when the backdrop is pressed                                                                                                        |
| `onModalWillHide`                | `func`               | `() => null`                     | Called before the modal hide animation begins                                                                                              |
| `onModalHide`                    | `func`               | `() => null`                     | Called after the content and backdrop have finished exiting                                                                                                 |
| `onModalWillShow`                | `func`               | `() => null`                     | Called before the modal show animation begins                                                                                              |
| `onModalShow`                    | `func`               | `() => null`                     | Called when the modal is completely visible                                                                                                |
| `hideModalContentWhileAnimating` | `bool`               | `false`                          | Unmounts the modal children during the enter and exit animations                                                         |
| `style`                          | `any`                | `null`                           | Style applied to the modal                                                                                                                 |

## Frequently Asked Questions

### The component is not working as expected

Under the hood `react-native-modal` uses react-native original [Modal component](https://reactnative.dev/docs/modal).  
Before reporting a bug, try swapping `react-native-modal` with react-native original Modal component and, if the issue persists, check if it has already been reported as a [react-native issue](https://github.com/facebook/react-native/issues).

### The backdrop is not completely filled/covered on some Android devices (Galaxy, for one)

React-Native has a few issues detecting the correct device width/height of some devices.  
If you're experiencing this issue, you'll need to install [`react-native-extra-dimensions-android`](https://github.com/Sunhat/react-native-extra-dimensions-android).  
Then, provide the real window height (obtained from `react-native-extra-dimensions-android`) to the modal:

```javascript
const deviceWidth = Dimensions.get('window').width;
const deviceHeight =
  Platform.OS === 'ios'
    ? Dimensions.get('window').height
    : require('react-native-extra-dimensions-android').get(
        'REAL_WINDOW_HEIGHT',
      );

function WrapperComponent() {
  const [isModalVisible, setModalVisible] = useState(true);

  return (
    <Modal
      isVisible={isModalVisible}
      deviceWidth={deviceWidth}
      deviceHeight={deviceHeight}>
      <View style={{flex: 1}}>
        <Text>I am the modal content!</Text>
      </View>
    </Modal>
  );
}
```

### How can I hide the modal by pressing outside of its content?

The prop `onBackdropPress` allows you to handle this situation:

```javascript
<Modal
  isVisible={isModalVisible}
  onBackdropPress={() => setModalVisible(false)}>
  <View style={{flex: 1}}>
    <Text>I am the modal content!</Text>
  </View>
</Modal>
```

### The modal background doesn't animate properly

Are you sure you named the `isVisible` prop correctly? Make sure it is spelled correctly: `isVisible`, not `visible`.

### The modal doesn't change orientation

Add a `supportedOrientations={['portrait', 'landscape']}` prop to the component, as described [in the React Native documentation](https://reactnative.dev/docs/modal.html#supportedorientations).

Also, if you're providing the `deviceHeight` and `deviceWidth` props you'll have to manually update them when the layout changes.

### I can't show multiple modals one after another

Unfortunately right now react-native doesn't allow multiple modals to be displayed at the same time.
This means that, in `react-native-modal`, if you want to immediately show a new modal after closing one you must first make sure that the modal that your closing has completed its hiding animation by using the `onModalHide` prop.

### I can't show multiple modals at the same time

See the question above.
Showing multiple modals (or even alerts/dialogs) at the same time is not doable because of a react-native bug.
That said, I would strongly advice against using multiple modals at the same time because, most often than not, this leads to a bad UX, especially on mobile (just my opinion).

### The StatusBar style changes when the modal shows up

This issue has been discussed [here](https://github.com/react-native-community/react-native-modal/issues/50).  
The TLDR is: it's a know React-Native issue with the Modal component 😞

### The modal is not covering the entire screen

The modal style applied by default has a small margin.  
If you want the modal to cover the entire screen you can easily override it this way:

```js
<Modal style={{margin: 0}}>...</Modal>
```

### The modal enter/exit animation flickers

Make sure your `animationIn` and `animationOut` are set correctly.  
We noticed that, for example, using `fadeIn` as an exit animation makes the modal flicker (it should be `fadeOut`!).
Also, some users have noticed that setting backdropTransitionOutTiming={0} can fix the flicker without affecting the animation.

### The custom backdrop doesn't fill the entire screen

You need to specify the size of your custom backdrop component. You can also make it expand to fill the entire screen by adding a `flex: 1` to its style:

```javascript
<Modal isVisible={isModalVisible} customBackdrop={<View style={{flex: 1}} />}>
  <View style={{flex: 1}}>
    <Text>I am the modal content!</Text>
  </View>
</Modal>
```

### The custom backdrop doesn't dismiss the modal on press

You can provide an event handler to the custom backdrop element to dismiss the modal. The prop `onBackdropPress` is not supported for a custom backdrop.

```javascript
<Modal
  isVisible={isModalVisible}
  customBackdrop={
    <TouchableWithoutFeedback onPress={dismissModalHandler}>
      <View style={{flex: 1}} />
    </TouchableWithoutFeedback>
  }
/>
```

## Available animations

The existing animation names, including `slideInUp`, `slideOutDown`, `fadeIn`, `fadeOut`, `zoomIn`, and `zoomOut`, are supported. See the [preset definitions](./src/animation-presets.ts) for the full list.

You can also pass an object to `animationIn` or `animationOut` with at least two keyframes. Use `from` and `to`, or numeric progress keys from `0` to `1`. You can add an `easing` function or name and a `style` shared across keyframes.

```tsx
<Modal
  isVisible={isVisible}
  animationIn={{
    from: {opacity: 0, scale: 0.95},
    0.7: {opacity: 1},
    to: {opacity: 1, scale: 1},
  }}
  animationOut="fadeOut">
  {children}
</Modal>
```

## Migrating from the gesture-enabled version

Remove `swipeDirection`, `swipeThreshold`, `panResponderThreshold`, the `onSwipe*` callbacks, and the props that coordinated gestures with scrollable children (`propagateSwipe`, `scrollOffset`, `scrollOffsetMax`, `scrollTo`, `scrollHorizontal`). A `ScrollView` or `FlatList` inside the modal scrolls normally. To dismiss the modal, update `isVisible` from your close button, `onBackdropPress`, or `onBackButtonPress`.

Remove `useNativeDriver` and `useNativeDriverForBackdrop`. Reanimated runs the animations on the UI thread.

Use the `isVisible` prop to control the function component. If your app used a ref to the previous class instance, migrate that logic to props and lifecycle callbacks.

## Alternatives

- [React Native's built-in `<Modal>` component](https://reactnative.dev/docs/modal.html)
- [React Native Paper `<Modal>` component](https://callstack.github.io/react-native-paper/modal.html)
- [React Native Modalfy](https://github.com/colorfy-software/react-native-modalfy)

## Acknowledgements

Thanks [@oblador](https://github.com/oblador) for react-native-animatable, [@brentvatne](https://github.com/brentvatne) for the npm namespace and to anyone who contributed to this library!

Pull requests, feedbacks and suggestions are welcome!
