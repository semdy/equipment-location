import { queryUsers } from '../services/home';

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

export default {

  namespace: 'home',

  state: {
    statusList: [{
      percent: 0.8,
      color: "#4472c4",
      num: 43,
      name: '可调配'
    },
    {
      percent: 0.6,
      color: "#ff0000",
      num: 85,
      name: '异常'
    },
    {
      percent: 0.4,
      color: "#06c",
      num: 45,
      name: '占用'
    }]
  },

  subscriptions: {
    setup({dispatch, history}) {  // eslint-disable-line
    },
  },

  effects: {
    *fetch(_, { call, put }) {  // eslint-disable-line
      const response = yield call(delay, 1000);
      yield put({
        type: 'save',
        payload: response,
      });
    }
  },

  reducers: {
    save(state, action) {
      return {...state, ...action.payload};
    }
  },

};
