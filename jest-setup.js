import 'react-native-gesture-handler/jestSetup';

// Fix Expo import meta registry error
global.__ExpoImportMetaRegistry = {
  get(id) { return null; },
  set(id, value) { },
};

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Error: 'error',
    Warning: 'warning',
  },
}));

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn(() => ({
      loadAsync: jest.fn(),
      unloadAsync: jest.fn(),
      playAsync: jest.fn(),
      setOnPlaybackStatusUpdate: jest.fn(),
    })),
  },
}));

// Mock SoundManager
jest.mock('./src/Utils/SoundManager', () => ({
  play: jest.fn(),
  loadAll: jest.fn(),
}));
