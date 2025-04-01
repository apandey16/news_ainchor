process.env.EXPO_ROUTER_APP_ROOT = "./app/index.tsx";

module.exports = {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ]
  };