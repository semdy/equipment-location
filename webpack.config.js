const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const path = require('path');

module.exports = (webpackConfig, env) => {

  const iconPath = path.resolve(__dirname, 'src/assets/icons');

  webpackConfig.module.rules.forEach(item => {
    if (String(item.loader).indexOf('url-loader') > -1) {
      item.exclude.push(iconPath)
    }
  });

  webpackConfig.module.rules = [
    ...webpackConfig.module.rules,
    ...[
      {
        test: /\.svg$/i,
        loader: 'svg-sprite-loader',
        include: iconPath
      }
    ]
  ];

  webpackConfig.plugins = webpackConfig.plugins.concat([
    new SpriteLoaderPlugin(({
      plainSprite: true,
      spriteAttrs: {
        id: 'SVG_SPRITE_NODE'
      }
    })),
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: './public/index.html',
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    })
  ]);

  return webpackConfig;
};
