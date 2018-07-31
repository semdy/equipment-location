import '@babel/polyfill';
import dva from 'dva';

import createLoading from 'dva-loading';
import registerServiceWorker from './registerServiceWorker';

import './common.less';
import './index.less';
import './components/animate/animate.less';

// requires and returns all modules that match
const requireAll = requireContext => requireContext.keys().map(requireContext);
// import all svg
const req = require.context('./assets/icons', true, /\.svg$/);
requireAll(req);

require('raf').polyfill();

// 1. Initialize
const app = dva({
    onError(e, dispatch) {
      console.log(e.message);
    },
  });

// 2. Plugins
app.use(createLoading());

// 3. Model
app.model(require('./models/global').default);

// 4. Router
app.router(require('./routes/router').default);

// 5. Start
app.start('#root');

// service worker
if (window.location.protocol === 'https:') {
  registerServiceWorker();
}

export default app._store;  // eslint-disable-line
