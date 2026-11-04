module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-vector-icons|react-native-linear-gradient|react-native-gifted-charts|gifted-charts-core|react-native-svg|react-native-paper)/)',
  ],
};
