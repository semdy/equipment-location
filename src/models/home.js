import {queryProvinces, queryCities, queryList, queryDetail, queryStats} from '../services/home'

export default {

  namespace: 'home',

  state: {
    mapZoom: 8,
    markers: [],
    stats: [],
    detail: {}
  },

  effects: {
    *fetchProvinces(_, { call, put }) {
      const response = yield call(queryProvinces)
      const stats = yield call(queryStats)
      yield put({
        type: 'saveProvince',
        payload: {
          markers: response,
          stats
        }
      })
    },
    *fetchCities({ payload }, { call, put }) {
      const response = yield call(queryCities, payload.province)
      const stats = yield call(queryStats, payload.province)
      yield put({
        type: 'saveCity',
        payload: {
          markers: response,
          stats
        }
      })
    },
    *search({ payload }, { call, put }) {
      const response = yield call(queryList, payload.city, payload.address, payload.equiptId, payload.status)
      const stats = yield call(queryStats, payload.province, payload.city)
      yield put({
        type: 'saveSearch',
        payload: {
          markers: response,
          stats
        }
      })
    },
    *fetchDetail({ payload }, { call, put }) {
      const detail = yield call(queryDetail, payload.RFID)
      yield put({
        type: 'saveDetail',
        payload: detail
      })
    }
  },

  reducers: {
    saveProvince(state, action) {
      return {
        ...state,
        ...action.payload
      }
    },
    saveCity(state, action) {
      return {
        ...state,
        ...action.payload,
        mapZoom: 12
      }
    },
    saveSearch(state, action) {
      return {
        ...state,
        ...action.payload,
        detail: {},
        mapZoom: 13
      }
    },
    saveDetail(state, action) {
      const {flows, task, device, toolBox} = action.payload
      return {
        ...state,
        stats: [],
        markers: flows,
        detail: { task, toolBox, device }
      }
    }
  }
}
