import {queryProvinces, queryCities, queryList, queryDetail} from '../services/home'

export default {

  namespace: 'home',

  state: {
    mapZoom: 8,
    markers: [],
    detail: {}
  },

  subscriptions: {
    setup({dispatch, history}) {
    },
  },

  effects: {
    *fetchProvinces(_, { call, put }) {
      const response = yield call(queryProvinces);
      yield put({
        type: 'saveProvince',
        payload: response
      });
    },
    *fetchCities({ payload }, { call, put }) {
      const response = yield call(queryCities, payload.city);
      yield put({
        type: 'saveCity',
        payload: response,
      });
    },
    *search({ payload }, { call, put }) {
      const response = yield call(queryList, payload.city, payload.address, payload.equiptId);
      yield put({
        type: 'saveSearch',
        payload: response,
      });
    },
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(queryDetail, payload);
      yield put({
        type: 'saveDetail',
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
      state.detail = {}
      state.mapZoom = 12
      return state
    },
    saveDetail(state, action) {
      const {flows, device, toolBox, statusList} = action.payload
      state.markers = flows
      Object.assign(state.detail, {toolBox, device, statusList})
      return state
    }
  }

};
