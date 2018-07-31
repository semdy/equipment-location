import React from 'react'
import { routerRedux, Route, Switch, Redirect } from 'dva/router'

const { ConnectedRouter } = routerRedux

function RouterConfig({ history, app }) {
  const {Home, Animate} = require('./getRoutes').default(app)
  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/home" exact component={Home} />
        <Route path="/animate" exact component={Animate} />
        <Redirect from="/" to="/home" />
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig
