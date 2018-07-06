import dva from 'dva';
import './common.less';
import './index.less';
import './components/animate/animate.less';

import createLoading from 'dva-loading';

// requires and returns all modules that match
const requireAll = requireContext => requireContext.keys().map(requireContext);
// import all svg
const req = require.context('./assets/icons', true, /\.svg$/);
requireAll(req);

// 1. Initialize
const app = dva({
    onError(e, dispatch) {
      console.log(e.message);
    },
  });

// 2. Plugins
app.use(createLoading());

// 3. Model
app.model(require('./models/home').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
