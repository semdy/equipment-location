import fetch from '../utils/request'
import {geocode} from '../utils/geocoder'

export async function queryProvinces(map) {
  let data = await fetch.get('/count/province')

  return await Promise.all(data.map(async item => {
    let position = await geocode(map, item.province)
    return {
      ...item,
      position,
      name: item.province,
      style: 'circle',
      type: 'province'
    }
  }))
}

export async function queryCities(map, province) {
  let data = await fetch.get('/count/city', { province })

  return await Promise.all(data.map(async item => {
    let position = await geocode(map, item.city)
    return {
      ...item,
      position,
      name: item.city,
      style: 'circle',
      type: 'city'
    }
  }))
}

export function queryList(city, address, RFID) {
  fetch.get('/find/toolBox/list', { city, address, RFID })
}
