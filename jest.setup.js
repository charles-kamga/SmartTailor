/* eslint-env jest */

// Mock des modules natifs pour Jest
jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(() => Promise.resolve({ rows: { _array: [], length: 0 } })),
  })),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() => Promise.resolve({ user: { id: '1', name: 'Test' } })),
    getTokens: jest.fn(() => Promise.resolve({ accessToken: 'mock_token' })),
    getCurrentUser: jest.fn(() => Promise.resolve(null)),
    signOut: jest.fn(() => Promise.resolve()),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

const mockStorage = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key, value) => {
    mockStorage[key] = value;
    return Promise.resolve(null);
  }),
  getItem: jest.fn((key) => Promise.resolve(mockStorage[key] || null)),
  removeItem: jest.fn((key) => {
    delete mockStorage[key];
    return Promise.resolve(null);
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    return Promise.resolve(null);
  }),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');
