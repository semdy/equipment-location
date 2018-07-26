import { queryProvinces, queryCities, queryList } from '../services/home';

export default {

  namespace: 'home',

  state: {
    mapZoom: 8,
    markers: [],
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
    *fetchProvinces({ payload }, { call, put }) {  // eslint-disable-line
      const response = yield call(queryProvinces, payload);
      yield put({
        type: 'saveProvince',
        payload: response,
      });
    },
    *fetchCities({ payload }, { call, put }) {  // eslint-disable-line
      const response = yield call(queryCities, payload.map, payload.name);
      yield put({
        type: 'saveCity',
        payload: response,
      });
    },
    *search({ payload }, { call, put }) {  // eslint-disable-line
      const response = yield call(queryList, payload.city, payload.address, payload.equiptId);
      yield put({
        type: 'saveSearch',
        payload: response,
      });
    }
  },

  reducers: {
    saveProvince(state, action) {
      state.markers = action.payload
      return state
    },
    saveCity(state, action) {
      state.markers = action.payload
      state.mapZoom = 12
      return state
    },
    saveSearch(state, action) {
      state.markers = action.payload
      return state
    },
  },

};
