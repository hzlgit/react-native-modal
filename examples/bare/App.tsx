import React, { useState } from 'react';
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import ReactNativeModal, {
  CustomAnimation,
  SupportedAnimation,
} from '@hjzl/react-native-modal';

const contentDemos = [
  { id: 'basic', title: 'Basic modal' },
  { id: 'scroll', title: 'ScrollView' },
  { id: 'input', title: 'TextInput' },
  { id: 'scroll-input', title: 'ScrollView + TextInput' },
] as const;

type ContentDemo = (typeof contentDemos)[number];
type AnimationDemo = {
  id: 'animation';
  title: string;
  animationIn: SupportedAnimation;
  animationOut: SupportedAnimation;
};
type Demo = ContentDemo | AnimationDemo;

const rows = Array.from({ length: 40 }, (_, index) => index + 1);
const formFields = [
  'Full name',
  'Company',
  'Email',
  'Phone',
  'Street address',
  'City',
  'Postal code',
  'Delivery notes',
];

const customEnter: CustomAnimation = {
  from: { opacity: 0, scale: 0.85 },
  0.75: { opacity: 1, scale: 1.04 },
  to: { opacity: 1, scale: 1 },
};

const customExit: CustomAnimation = {
  from: { opacity: 1, scale: 1 },
  to: { opacity: 0, scale: 0.85 },
};

const animationDemos: readonly AnimationDemo[] = [
  {
    id: 'animation',
    title: 'Vertical slide',
    animationIn: 'slideInUp',
    animationOut: 'slideOutDown',
  },
  {
    id: 'animation',
    title: 'Horizontal slide',
    animationIn: 'slideInLeft',
    animationOut: 'slideOutRight',
  },
  {
    id: 'animation',
    title: 'Fade',
    animationIn: 'fadeIn',
    animationOut: 'fadeOut',
  },
  {
    id: 'animation',
    title: 'Zoom',
    animationIn: 'zoomIn',
    animationOut: 'zoomOut',
  },
  {
    id: 'animation',
    title: 'Bounce',
    animationIn: 'bounceIn',
    animationOut: 'bounceOut',
  },
  {
    id: 'animation',
    title: 'Flip',
    animationIn: 'flipInY',
    animationOut: 'flipOutY',
  },
  {
    id: 'animation',
    title: 'Light speed',
    animationIn: 'lightSpeedIn',
    animationOut: 'lightSpeedOut',
  },
  {
    id: 'animation',
    title: 'Custom keyframes',
    animationIn: customEnter,
    animationOut: customExit,
  },
];

function animationName(animation: SupportedAnimation) {
  return typeof animation === 'string' ? animation : 'Custom keyframes';
}

function DemoSection({
  title,
  demos,
  onSelect,
}: {
  title: string;
  demos: readonly Demo[];
  onSelect: (demo: Demo) => void;
}) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      {demos.map((demo) => (
        <Button
          key={demo.title}
          title={demo.title}
          onPress={() => onSelect(demo)}
        />
      ))}
    </View>
  );
}

function Field({
  label,
  multiline,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor="#64748b"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

function SampleContent({ id }: { id: ContentDemo['id'] }) {
  switch (id) {
    case 'scroll':
      return (
        <ScrollView style={styles.scrollArea} accessibilityLabel="Sample list">
          {rows.map((row) => (
            <Text key={row} style={styles.row}>
              Row {row}
            </Text>
          ))}
        </ScrollView>
      );
    case 'input':
      return (
        <View>
          <Field label="Name" autoCapitalize="words" />
          <Field label="Notes" multiline />
        </View>
      );
    case 'scroll-input':
      return (
        <ScrollView
          style={styles.scrollArea}
          accessibilityLabel="Sample form"
          keyboardShouldPersistTaps="handled"
        >
          {formFields.map((label) => (
            <Field key={label} label={label} />
          ))}
        </ScrollView>
      );
    case 'basic':
      return (
        <Text style={styles.body}>
          Close with the button, the backdrop, or Android Back.
        </Text>
      );
  }
}

function App(): React.JSX.Element {
  const [activeCase, setActiveCase] = useState<Demo>(contentDemos[0]);
  const [visible, setVisible] = useState(false);
  const animation = activeCase.id === 'animation' ? activeCase : null;
  const openModal = (demo: Demo) => {
    setActiveCase(demo);
    setVisible(true);
  };
  const closeModal = () => setVisible(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.menu}>
          <Text accessibilityRole="header" style={styles.heading}>
            Modal examples
          </Text>
          <DemoSection
            title="Interaction"
            demos={contentDemos}
            onSelect={openModal}
          />
          <DemoSection
            title="Animations"
            demos={animationDemos}
            onSelect={openModal}
          />
        </ScrollView>
        <ReactNativeModal
          isVisible={visible}
          avoidKeyboard={
            activeCase.id === 'input' || activeCase.id === 'scroll-input'
          }
          animationIn={animation?.animationIn ?? 'slideInUp'}
          animationOut={animation?.animationOut ?? 'slideOutDown'}
          animationInTiming={animation ? 500 : 300}
          animationOutTiming={animation ? 500 : 300}
          onBackdropPress={closeModal}
          onBackButtonPress={closeModal}
        >
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.title}>
              {activeCase.title}
            </Text>
            {activeCase.id === 'animation' ? (
              <View>
                <Text style={styles.body}>
                  Enter · {animationName(activeCase.animationIn)}
                </Text>
                <Text style={styles.body}>
                  Exit · {animationName(activeCase.animationOut)}
                </Text>
              </View>
            ) : (
              <SampleContent key={activeCase.id} id={activeCase.id} />
            )}
            <Button title="Close modal" onPress={closeModal} />
          </View>
        </ReactNativeModal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  menu: {
    padding: 24,
    gap: 12,
  },
  section: {
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
  heading: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    flexShrink: 1,
    gap: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  title: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
  },
  body: {
    color: '#334155',
    fontSize: 16,
  },
  scrollArea: {
    flexGrow: 0,
    flexShrink: 1,
    maxHeight: 360,
  },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e1',
    color: '#334155',
    fontSize: 16,
  },
  field: {
    marginBottom: 12,
    gap: 6,
  },
  label: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0f172a',
    fontSize: 16,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});

export default App;
