import {Geocoder} from 'BMap'

let geocoder = new Geocoder()

const geocode = (address, fallback) => {
  return new Promise((resolve, reject) => {
    geocoder.getPoint(address, (point) => {
      if (point) {
        resolve(point)
      } else {
        reject(null)
      }
    }, fallback)
  })
}

const generateGeocode = async (addrs, fallback) => {
  return await Promise.all(addrs.map(async addr =>
     await geocode(addr, fallback)
  ))
}

export {geocode, generateGeocode, geocoder}
