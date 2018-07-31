import fetch from '../utils/request'
import { geocode } from '../utils/geocoder'
import { caclTotal } from "../utils/common"

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
    return {
      ...item,
      type: 'toolbox'
    }
  })
}

export async function queryStats(province, city) {
  let data = await fetch.get('/count/status', { province, city })
  const COLOR_MAP = {
    '异常': '#ff0000',
    '占用': '#ff8300',
    '可调配': '#008000'
  }
  const total = caclTotal(data, 'count')
  return data.map(item => {
    return {
      ...item,
      percent: parseFloat(item.count)/total,
      color: item.color || COLOR_MAP[item.status] || 'blue'
    }
  })
}

export async function queryDetail(RFID) {
  let { task, toolBox, device } = await fetch.get('/find/toolBox/one', { RFID })
  let flows = []
  task.transflow.forEach((item, i, self) => {
    let icon = ''
    let prefix = ''

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

    flows.push({
      icon,
      prefix,
      position: item.position,
      address: item.address,
      date: item.date,
      RFID: toolBox.RFID
    })
  })

  if (task.endPosition) {
    flows.push({
      icon: 'end',
      prefix: '到达',
      position: {lat: task.endPosition.lat, lng: task.endPosition.lng},
      address: task.endAddress,
      RFID: toolBox.RFID
    })
  }

  return {
    toolBox,
    task: {id: task.id, remark: task.remark},
    flows,
    device
  }
}
