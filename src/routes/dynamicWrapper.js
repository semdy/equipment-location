import { createElement } from 'react';
import dynamic from 'dva/dynamic';

const modelNotExisted = (app, model) => (
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  })
);

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    })
    return (props) => {
      return createElement(component().default, {
        ...props
      })
    }
  }
  // () => import('module')
  return dynamic({
    app,
    models: () => models.filter(
      model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)
    ),
    component: () => {
      return component().then((raw) => {
        const Component = raw.default || raw
        return props => createElement(Component, {
          ...props
        })
      })
    }
  })
}

export default dynamicWrapper
