import asyncComponent from "../components/AsyncComponent";

export const Home = asyncComponent(() => import(
  /* webpackChunkName: "home" */
  "./home/home"
));
export const Animate = asyncComponent(() => import(
  /* webpackChunkName: "animate" */
  "./animate/animate"
));
