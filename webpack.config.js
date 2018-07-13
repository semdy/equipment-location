const path = require('path');

module.exports = (webpackConfig, env) => {
  const iconPath = path.resolve(__dirname, 'src/assets/icons');

  webpackConfig.module.rules.forEach(item => {
    if (String(item.test) === '/\\.html$/') {
      item.loader = require.resolve('html-loader')
    }
    if (String(item.loader).indexOf('url-loader') > -1) {
      item.exclude.push(iconPath)
    }
  });

  webpackConfig.module.rules.push({
    test: /\.svg$/i,
    loader: 'svg-sprite-loader',
    include: iconPath,
    exclude: /node_modules/
  });

  return webpackConfig;
};
