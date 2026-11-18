const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const libraryDist = path.resolve(__dirname, '../../dist');
const appEntry = path.join(__dirname, 'index.js');
const sharedDependency =
  /^(@babel\/runtime|react|react-native|react-native-reanimated|react-native-worklets)(\/|$)/;

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  watchFolders: [libraryDist],
  resolver: {
    resolveRequest(context, moduleName, platform) {
      if (moduleName === '@hjzl/react-native-modal') {
        return {
          type: 'sourceFile',
          filePath: path.join(libraryDist, 'index.js'),
        };
      }

      const fromLibrary = context.originModulePath.startsWith(
        libraryDist + path.sep,
      );
      return context.resolveRequest(
        fromLibrary && sharedDependency.test(moduleName)
          ? { ...context, originModulePath: appEntry }
          : context,
        moduleName,
        platform,
      );
    },
  },
});
