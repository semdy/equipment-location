import fetch from '../utils/request'
import { geocode } from '../utils/geocoder'
import { caclTotal } from "../utils/common"

export async function queryProvinces() {
  try {
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
  } catch(e) {
    return []
  }
}

export async function queryCities(province) {
  try {
    let data = await fetch.get('/count/city', {province})
    return await Promise.all(data.map(async item => {
      const {lat, lng} = await geocode(item.city)
      return {
        ...item,
        position: {lat, lng},
        name: item.city,
        type: 'city'
      }
    }))
  } catch (e) {
    return []
  }
}

export async function queryList(city, address, RFID, status) {
  try {
    let data = await fetch.get('/find/toolBox/list', {city, address, RFID, status})
    return data.map(item => {
      return {
        ...item,
        type: 'toolbox'
      }
    })
  } catch (e) {
    return []
  }
}

export async function queryStats(province, city) {
  try {
    let data = await fetch.get('/count/status', {province, city})
    const COLOR_MAP = {
      '异常': '#ff0000',
      '占用': '#ff8300',
      '可调配': '#008000'
    }
    const total = caclTotal(data, 'count')
    return data.map(item => {
      return {
        ...item,
        percent: parseFloat(item.count) / total || 0,
        color: item.color || COLOR_MAP[item.status] || 'blue'
      }
    })
  } catch (e) {
    return []
  }
}

export async function queryDetail(RFID) {
  try {
    let {task, toolBox, device} = await fetch.get('/find/toolBox/one', {RFID})
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
  } catch(e) {
    return {
      toolBox: {},
      task: {},
      flows: [],
      device: {}
    }
  }
}
