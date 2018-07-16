const path = require('path');
export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
      html: {
        template: './public/index.html',
        inject: true
      }
    },
    production: {
      commons: [
        {
          name: 'vendor',
          minChunks: function (module) {
            if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
              return false;
            }
            return module.context && module.context.includes("node_modules");
          }
        },
        {
          async: 'async-chunk',
          children: true,
          minChunks: (module, count) => (
            count >= 2
          )
        },
        {
          name: 'manifest',
          minChunks: Infinity
        }
      ],
      html: {
        template: './public/index.html',
        inject: true,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        }
      },
      manifest: {
        fileName: 'asset-manifest.json'
      },
      serviceworker: true
    }
  },
  alias: {
    '@components': path.resolve(__dirname, 'src/components/')
  },
  externals:{
    'BMap':'BMap'
  },
  ignoreMomentLocale: true,
  disableDynamicImport: false,
  publicPath: '/',
  hash: true
};
