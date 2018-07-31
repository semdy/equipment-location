import dynamicWrapper from "./dynamicWrapper"

function getRoutes(app) {
  return {
    Home: dynamicWrapper(app, ['home'], () => import(/* webpackChunkName: "home" */ './home/home')),
    Animate: dynamicWrapper(app, [], () => import(/* webpackChunkName: "animate" */ './animate/animate'))
  }
}

export default getRoutes
