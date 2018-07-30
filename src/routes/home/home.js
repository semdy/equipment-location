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
import {Input, Popover} from 'antd'
import { formatDate } from '../../utils/common'
import styles from './home.less'

const Search = Input.Search

@connect(({home, loading}) => ({
    home,
    loading: loading.global,
  })
)
export default class Home extends Component {

  curCity = ''
  address = ''
  equiptId = ''
  isCircleMarker = true
  showPath = false

  state = {
    infobox: {
      position: {},
      title: '',
      content: '',
      isOpen: false
    },
    toolxhide: false,
    toolyhide: false,
  }

  handleMarkerClick(marker) {
    this.showPath = false
    if (marker.type === 'province') {
      this.props.dispatch({
        type: 'home/fetchCities',
        payload: {
          city: marker.name
        }
      })
      this.curCity = marker.name
    }
    else if (marker.type === 'city') {
      this.handleSearch()
    }
    else if (marker.type === 'toolbox') {
      this.showPath = true
      this.props.dispatch({
        type: 'home/fetchDetail',
        payload: marker.RFID
      })
    }
  }

  handleMarkerOver(marker) {
    if (!this.isCircleMarker) {
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
    if (!this.isCircleMarker) {
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
        city: this.curCity
      }
    })
    this.isCircleMarker = false
    this.showPath = false
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

  componentDidMount() {
    this.props.dispatch({
      type: 'home/fetchProvinces'
    })
  }

  renderToolBox() {
    const { detail, markers } = this.props.home
    const { toolBox, device } = detail
    const { toolxhide, toolyhide } = this.state

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
            <p>最近定位时间：{formatDate(new Date(toolBox.updatedAt), 'yyyy/MM/dd HH:mm')}</p>
            <p>任务状态：{toolBox.remark}</p>
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
            <h4>工具箱数：6</h4>
            <div>
              <p>工具箱A：3</p>
              <p>工具箱B：3</p>
              <p>工具箱C：3</p>
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

  renderStats() {
    const { detail } = this.props.home
    const { statusList } = detail

    return (
      <div className={styles.statusContainer}>
        <h2 className={styles.statusTitle}>
          数据统计
        </h2>
        <div className={styles.statusBd}>
          {
            statusList.map((item, i) => (
              <div key={i} className={styles.statusItem}>
                <PercentageCircle
                  radius={55}
                  percent={item.percent}
                  color={item.color}
                  className={styles.circleWrap}
                >
                      <span className={styles.circleLabel}>
                        {item.num}
                      </span>
                </PercentageCircle>
                <h4>
                  {item.name}
                </h4>
              </div>
            ))
          }
        </div>
      </div>
    )
  }

  renderMap() {
    let { markers, mapZoom } = this.props.home
    let { infobox } = this.state

    return (
      <div className={styles.mapContainer}>
        <Map
          center={this.curCity ? this.curCity : (markers.length > 0 ? markers[0].position : undefined)}
          zoom={mapZoom}
        >
          {
            markers.map((marker, i) => (
              <Marker
                key={i}
                position={marker.position}
                icon={marker.icon || 'simple_red'}
                offset={
                  this.isCircleMarker
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
                  this.isCircleMarker &&
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
          <Polyline path={markers} showPath={this.showPath} />
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
      </div>
    )
  }

  render() {
    const { detail } = this.props.home
    return (
      <div className={styles.container}>
        <Spinner loading={this.props.loading} />
        <header className={styles.header}>
          <div className={classnames(styles.headerInner, 'clearfix')}>
            <div className={classnames('fn-left', styles.headerLeft)}>
              <img className={styles.logo} src={require("../../assets/img/logo.jpeg")} alt=""/>
              <h1>硬件定位系统</h1>
            </div>
            <div className={classnames('fn-right', styles.headerRight)}>
              <Search
                placeholder="输入目的地查询"
                value={this.address}
                onChange={e => this.setAddress(e.target.value)}
                onSearch={value => this.handleSearch(value)}
                style={{width: 200, marginRight: 15}}
              />
              <Search
                placeholder="输入设备id查询"
                value={this.equiptId}
                onChange={e => this.setEquiptId(e.target.value)}
                onSearch={value => this.handleSearch(value)}
                style={{width: 200}}
              />
            </div>
          </div>
        </header>

        <div className={styles.main}>
          { detail.statusList && this.renderStats() }
          { this.renderMap() }
          { detail.toolBox && this.renderToolBox() }
        </div>

        <Popover visible={false} />

      </div>
    )
  }
}

Home.propTypes = {}
