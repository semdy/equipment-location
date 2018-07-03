import React from 'react';
import { routerRedux, Route, Switch, Redirect } from 'dva/router';
import Home from './routes/home/home';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history }) {
  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/home" exact component={Home} />
        <Redirect from="/" to="/home" />
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig;
