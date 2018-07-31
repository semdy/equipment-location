import {queryProvinces, queryCities, queryList, queryDetail, queryStats} from '../services/home'

export default {

  namespace: 'home',

  state: {
    mapZoom: 8,
    markers: [],
    detail: {}
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
      const detail = yield call(queryDetail, payload.RFID);
      const stats = yield call(queryStats, payload.province, payload.city);
      yield put({
        type: 'saveDetail',
        payload: {
          detail,
          stats
        },
      });
    }
  },

  reducers: {
    saveProvince(state, action) {
      return {
        ...state,
        markers: action.payload
      }
    },
    saveCity(state, action) {
      return {
        ...state,
        markers: action.payload,
        mapZoom: 12
      }
    },
    saveSearch(state, action) {
      return {
        ...state,
        markers: action.payload,
        detail: {},
        mapZoom: 12
      }
    },
    saveDetail(state, action) {
      const {flows, task, device, toolBox} = action.payload.detail
      const {stats} = action.payload
      return {
        ...state,
        markers: flows,
        detail: { task, toolBox, device, stats }
      }
    }
  }
}
