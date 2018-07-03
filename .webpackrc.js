const path = require('path');
export default {
  entry: 'src/index.js',
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }],
  ],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    '@components': path.resolve(__dirname, 'src/components/')
  },
  commons: [
    {
      async: '__common',
      children: true,
      minChunks(module, count) {
        if(module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
          return false;
        }
        return module.context && module.context.includes("node_modules");
      },
    },
  ],
  externals:{
    'BMap':'BMap'
  },
  ignoreMomentLocale: true,
  disableDynamicImport: false,
  publicPath: '/',
  hash: true,
};
