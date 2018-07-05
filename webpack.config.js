const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
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
  ]);

  return webpackConfig;
};
