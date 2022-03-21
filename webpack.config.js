const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  config.output.publicPath = '/';
  config.devServer = {
      ...config.devServer,
      historyApiFallback: true,
  };
  return config;
};