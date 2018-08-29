import React, {Component} from 'react'
import {connect} from 'dva'
import BMap from 'BMap'
import {
  Spinner,
  Icon,
  Map,
  Marker,
  InfoBox,
  MarkerGroup,
  Polyline,
  MarkerIcon,
  PercentageCircle
} from '../../components'
import classnames from 'classnames'
import {Input, Popover, notification} from 'antd'
import {formatDate, caclTotal} from '../../utils/common'
import styles from './home.less'

const Search = Input.Search

@connect(({home, loading}) => ({
    home,
    loading: loading.global,
  })
)
export default class Home extends Component {

  curProvince = ''
  curCity = ''
  address = ''
  equiptId = ''
  statStatus = ''
  customMarker = true
  showPath = false
  queryLevel = 0

  state = {
    infobox: {
      position: {},
      title: '',
      content: '',
      isOpen: false
    },
    toolxhide: false,
    toolyhide: false,
    hideStats: false
  }

  handleMarkerClick(marker) {
    if (marker.type === 'province') {
      this.curProvince = marker.name
      this.queryLevel = 1
      this.props.dispatch({
        type: 'home/fetchCities',
        payload: {
          province: marker.name
        }
      })
    }
    else if (marker.type === 'city') {
      this.curCity = marker.name
      this.queryLevel = 2
      this.handleSearch()
    }
    else if (marker.type === 'toolbox') {
      this.showPath = true
      this.queryLevel = 3
      this.handleMarkerMouseout()
      this.props.dispatch({
        type: 'home/fetchDetail',
        payload: {
          RFID: marker.RFID,
          province: this.curProvince,
          city: this.curCity
        }
      })
    }
  }

  handleMarkerOver(marker) {
    if (!this.customMarker) {
      this.setState({
        infobox: {
          position: marker.position,
          title: marker.RFID,
          content: marker.address,
          isOpen: true
        }
      })
    }
  }

  handleMarkerMouseout() {
    if (!this.customMarker) {
      this.setState({
        infobox: {
          isOpen: false
        }
      })
    }
  }

  setAddress(address) {
    this.address = address
  }

  setEquiptId(equiptId) {
    this.equiptId = equiptId
  }

  handleSearch() {
    this.props.dispatch({
      type: 'home/search',
      payload: {
        address: this.address,
        equiptId: this.equiptId,
        province: this.curProvince,
        city: this.curCity,
        status: this.statStatus
      }
    })
    .then(() => {
      if (this.props.home.markers.length === 0) {
        notification.error({
          message: '提示',
          description: '当前位置没有设备信息'
        })
      }
    })
    this.customMarker = false
    this.showPath = false
    this.setState({
      toolxhide: false,
      toolyhide: false,
      hideStats: false
    })
  }

  gotoUpLevel() {
    this.queryLevel = Math.max(0, --this.queryLevel)

    if (this.queryLevel === 0) {
      this.customMarker = true
      this.props.dispatch({
        type: 'home/fetchProvinces'
      })
    }
    else if (this.queryLevel === 1) {
      this.customMarker = true
      this.props.dispatch({
        type: 'home/fetchCities',
        payload: {
          province: this.curCity
        }
      })
    }
    else if (this.queryLevel === 2) {
      this.handleSearch()
    }
  }

  filterByStatus(status) {
    this.statStatus = status
    this.queryLevel = 1
    this.handleSearch()
  }

  toggleToolPanel(type) {
    switch (type) {
      case 'x-hide':
        this.setState({
          toolxhide: !this.state.toolxhide
        })
        break
      case 'y-hide':
        this.setState({
          toolyhide: !this.state.toolyhide
        })
        break
    }
  }

  toggleStatsPanel() {
    this.setState({
      hideStats: !this.state.hideStats
    })
  }

  getMapCenter() {
    let {markers} = this.props.home
    return this.curCity || this.address || markers.length > 0 && markers[0].position || this.curProvince || undefined
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'home/fetchProvinces'
    }).then(() => {
      const {markers} = this.props.home
      this.curProvince = markers.length > 0 ? markers[0].name : ''
      this.queryLevel = 0
    })
  }

  renderStats() {
    const {stats} = this.props.home
    const {hideStats} = this.state

    return (
      <div className={classnames(styles.statusContainer, {[styles.statsHide]: hideStats})}>
        <h2 className={styles.statusTitle}>
          数据统计
        </h2>
        <div className={styles.statusBd}>
          {
            stats.map((item, i) => (
              <div
                key={i}
                className={styles.statusItem}
                onClick={() => this.filterByStatus(item.status)}
              >
                <PercentageCircle
                  radius={55}
                  percent={item.percent}
                  color={item.color}
                  className={styles.circleWrap}
                >
                  <span className={styles.circleLabel}>
                    {item.count}
                  </span>
                </PercentageCircle>
                <h4>
                  {item.status}
                </h4>
              </div>
            ))
          }
        </div>
        <div className={styles.statusToggle} onClick={() => this.toggleStatsPanel()}>
          <Icon name='arrow-left-hg'/>
        </div>
      </div>
    )
  }

  renderToolBox() {
    const {detail, markers} = this.props.home
    const {task, toolBox, device} = detail
    const {toolxhide, toolyhide} = this.state

    return (
      <div className={classnames(styles.toolWrap, {[styles.xhide]: toolxhide})}
           style={{bottom: toolyhide ? 'auto' : '0'}}
      >
        <div className={styles.topTool}
             style={{display: toolyhide ? 'block' : 'none'}}
             onClick={() => this.toggleToolPanel('y-hide')}
        >
          <Icon name='arrow-down-ob' style={{marginRight: 5}}/>
          <span className={styles.routeHint}>工具箱号：{toolBox.RFID}</span>
        </div>
        <div className={styles.sideTool}
             style={{display: toolyhide ? 'none' : 'block'}}
             onClick={() => this.toggleToolPanel('x-hide')}
        >
          <Icon name='angle-right'/>
        </div>
        <div className={classnames(styles.toolPanel, {[styles.yhide]: toolyhide})}>
          <div className={classnames(styles.panelCommon, styles.toolPanelHd)}>
            工具箱号：{toolBox.RFID}
          </div>
          <div className={classnames(styles.panelCommon, styles.toolItem)}>
            <p>最近定位时间：{formatDate(toolBox.updatedAt, 'yyyy/MM/dd HH:mm')}</p>
            <p>任务状态：{task.remark}</p>
            <p>工具状态：{toolBox.status}</p>
            <p>设备状态: {device.status}</p>
          </div>

          <div className={classnames(styles.panelCommon, styles.toolItem)}>
            {
              markers.map((item, i) => {
                return (
                  <div className={styles.routeItem} key={i}>
                    <MarkerIcon type={item.icon}/>
                    <span className={styles.routeHint}>
                      {item.prefix}位置：{item.address}
                    </span>
                  </div>
                )
              })
            }
          </div>

          <div className={classnames(styles.panelCommon, styles.toolItem)}>
            <h4>工具箱数：{caclTotal(toolBox.tool, 'count')}</h4>
            <div>
              {
                toolBox.tool && toolBox.tool.map((tool, i) => (
                  <p key={i}>{tool.name}：{tool.count}</p>
                ))
              }
            </div>
          </div>
        </div>

        <div className={styles.bottomTool}
             style={{display: toolyhide ? 'none' : ''}}
             onClick={() => this.toggleToolPanel('y-hide')}
        >
          <Icon name='arrow-up-ob' style={{marginRight: 5}}/>
          <span className={styles.routeHint}>隐藏</span>
        </div>

      </div>
    )
  }

  renderMap() {
    let { markers, mapZoom, detail } = this.props.home
    let { infobox } = this.state

    return (
      <div className={styles.mapContainer}>
        <Map
          center={this.getMapCenter()}
          zoom={mapZoom}
        >
          {
            markers.map((marker, i) => (
              <Marker
                key={i}
                position={marker.position}
                icon={marker.icon || 'simple_red'}
                offset={
                  this.customMarker
                    ? new BMap.Size(-40, -40)
                    : new BMap.Size(0, 0)
                }
                events={{
                  click: () => this.handleMarkerClick(marker),
                  mouseover: () => this.handleMarkerOver(marker),
                  mouseout: () => this.handleMarkerMouseout()
                }}
              >
                {
                  this.customMarker &&
                  <div className={styles.circleMarker}>
                    <span className={styles.markName}>
                      {marker.name}
                    </span>
                    <span className={styles.markCount}>
                      {marker.count}
                    </span>
                  </div>
                }
              </Marker>
            ))
          }
          <Polyline path={markers} showPath={this.showPath}/>
          <InfoBox
            position={infobox.position}
            isOpen={infobox.isOpen}
            offset={
              new BMap.Size(-88, 40)
            }
          >
            <div className="ant-popover ant-popover-placement-top map-popover" style={{position: 'relative'}}>
              <div className="ant-popover-content">
                <div className="ant-popover-arrow">
                </div>
                <div className="ant-popover-inner">
                  <div>
                    <div className="ant-popover-title">工具箱号：{infobox.title}</div>
                    <div className="ant-popover-inner-content">
                      当前位置：{infobox.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </InfoBox>
        </Map>
        {
          this.queryLevel > 0 &&
          <div className={classnames(styles.toUpperLevel, {[styles.toLeft]: !!detail.toolBox})}
               onClick={() => this.gotoUpLevel()}
          >
            <Icon name='upper-level' size='small' style={{marginRight: 5}} />
            <span>返回上一级</span>
          </div>
        }

      </div>
    )
  }

  render() {
    const {detail, stats} = this.props.home
    return (
      <div className={styles.container}>
        <Spinner loading={this.props.loading}/>
        <header className={styles.header}>
          <div className={classnames(styles.headerInner, 'clearfix')}>
            <div className={classnames('fn-left', styles.headerLeft)}>
              <img className={styles.logo} src={require("../../assets/img/logo.jpg")} alt=""/>
              <h1>硬件定位系统</h1>
            </div>
            <div className={classnames('fn-right', styles.headerRight)}>
              <Search
                placeholder="输入目的地查询"
                onChange={e => this.setAddress(e.target.value)}
                onSearch={value => this.handleSearch(value)}
                style={{width: 200, marginRight: 15}}
              />
              <Search
                placeholder="输入设备id查询"
                onChange={e => this.setEquiptId(e.target.value)}
                onSearch={value => this.handleSearch(value)}
                style={{width: 200}}
              />
            </div>
          </div>
        </header>

        <div className={styles.main}>
          {stats.length > 0 && this.renderStats()}
          {this.renderMap()}
          {detail.toolBox && this.renderToolBox()}
        </div>

        <Popover visible={false}/>

      </div>
    )
  }
}

Home.propTypes = {}
