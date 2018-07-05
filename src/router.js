import React from 'react';
import { routerRedux, Route, Switch, Redirect } from 'dva/router';
import Home from './routes/home/home';
import animate from './routes/animate/animate';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history }) {
  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/home" exact component={Home} />
        <Route path="/animate" exact component={animate} />
        <Redirect from="/" to="/home" />
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig;
