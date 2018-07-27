import fetch from '../utils/request'
import {geocode} from '../utils/geocoder'

export async function queryProvinces() {
  let data = await fetch.get('/count/province')

  return await Promise.all(data.map(async item => {
    const {lat, lng} = await geocode(item.province)
    return {
      ...item,
      position: {lat, lng},
      name: item.province,
      type: 'province'
    }
  }))
}

export async function queryCities(province) {
  let data = await fetch.get('/count/city', { province })

  return await Promise.all(data.map(async item => {
    const {lat, lng} = await geocode(item.city)
    return {
      ...item,
      position: {lat, lng},
      name: item.city,
      type: 'city'
    }
  }))
}

export async function queryList(city, address, RFID) {
  let data = await fetch.get('/find/toolBox/list', { city, address, RFID })
  return data.map(item => {
    const {latitude, longitude} = item.position
    return {
      ...item,
      type: 'toolbox',
      position: { lat: latitude, lng: longitude }
    }
  })
}

export function queryDetail(RFID) {
  return fetch.get('/find/toolBox/one', { RFID })
}
