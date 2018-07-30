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

export async function queryDetail(RFID) {
  let { task, toolBox, device } = await fetch.get('/find/toolBox/one', { RFID })
  let flows = []
  let transflow = Array.isArray(task.transflow) ? task.transflow : [task.transflow]

  transflow.forEach((item, i, self) => {
    let icon = ''
    let prefix = ''
    let position = {}

    if (i === 0) {
      icon = 'start'
      prefix = '起始'
    }
    else if (i === self.length - 1) {
      icon = 'geo_red'
      prefix = '当前'
    }
    else {
      icon = 'pass'
      prefix = '经过'
    }

    position = {lat: item.position.latitude, lng: item.position.longitude}

    flows.push({
      icon,
      prefix,
      position,
      address: item.address || item.addrees,
      date: item.date,
      RFID: toolBox.RFID
    })
  })

  if (task.endPosition) {
    flows.push({
      icon: 'end',
      prefix: '到达',
      position: {lat: task.endPosition.latitude, lng: task.endPosition.longitude},
      address: task.endAddress,
      RFID: toolBox.RFID
    })
  }

  return {
    toolBox,
    flows,
    device,
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
  }
}
