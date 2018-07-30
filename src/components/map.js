/**
 * @file 地图主文件
 * @author kyle(hinikai@gmail.com)
 */

import React from 'react';
import BMap from 'BMap';
import Component from './component';
import {isString} from '../utils/common';

export default class Map extends Component {

  constructor(args) {
    super(args);
  }

  /**
   * 设置默认的props属性
   */
  static get defaultProps() {
    return {
      style: {height: '100%'},
      center: {lng: 116.402544, lat: 39.928216},
      zoom: 5,
      enableScrollWheelZoom: true
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { zoom, minZoom, maxZoom, style, center, enableScrollWheelZoom } = this.props;

    if (
      zoom !== nextProps.zoom
      || minZoom !== nextProps.minZoom
      || maxZoom !== nextProps.maxZoom
      || style !== nextProps.style
      || enableScrollWheelZoom !== nextProps.enableScrollWheelZoom
    ) {
      return true;
    }

    for(let i in nextProps.center) {
      if (nextProps.center[i] !== center[i]) {
        return true;
      }
    }

    return false
  }

  /**
   * 获取可以给地图绑定的事件名
   */
  get events() {
    return [
      'click',
      'dblclick',
      'rightclick',
      'rightdblclick',
      'maptypechange',
      'mousemove',
      'mouseover',
      'mouseout',
      'movestart',
      'moving',
      'moveend',
      'zoomstart',
      'zoomend',
      'addoverlay',
      'addcontrol',
      'removecontrol',
      'removeoverlay',
      'clearoverlays',
      'dragstart',
      'dragging',
      'dragend',
      'addtilelayer',
      'removetilelayer',
      'load',
      'resize',
      'hotspotclick',
      'hotspotover',
      'hotspotout',
      'tilesloaded',
      'touchstart',
      'touchmove',
      'touchend',
      'longpress'
    ];
  }

  get toggleMethods() {
    return {
      enableScrollWheelZoom: ['enableScrollWheelZoom', 'disableScrollWheelZoom'],
      enableDragging: ['enableDragging', 'disableDragging'],
      enableDoubleClickZoom: ['enableDoubleClickZoom', 'disableDoubleClickZoom'],
      enableKeyboard: ['enableKeyboard', 'disableKeyboard'],
      enableInertialDragging: ['enableInertialDragging', 'disableInertialDragging'],
      enableContinuousZoom: ['enableContinuousZoom', 'disableContinuousZoom'],
      enablePinchToZoom: ['enablePinchToZoom', 'disablePinchToZoom'],
      enableAutoResize: ['enableAutoResize', 'disableAutoResize'],
    }
  }

  get options() {
    return [
      'minZoom',
      'maxZoom',
      'mapType',
      'enableMapClick'
    ]
  }

  componentDidMount() {
    this.initMap();
    this.forceUpdate();
  }

  componentDidUpdate(prevProps) {
    let preCenter = prevProps.center;
    let center = this.props.center;

    if (isString(center)) { // 可以传入城市名
      if (preCenter !== center) {
        this.map.centerAndZoom(center);
      }
    } else {
      let isCenterChanged = preCenter && center && preCenter.lng !== center.lng || preCenter.lat !== center.lat || this.props.forceUpdate;
      let isZoomChanged = prevProps.zoom !== this.props.zoom && this.props.zoom || this.props.forceUpdate;
      center = new BMap.Point(center.lng, center.lat);
      if (isCenterChanged && isZoomChanged) {
        this.map.centerAndZoom(center, this.props.zoom);
      } else if (isCenterChanged) {
        this.map.setCenter(center);
      } else if (isZoomChanged) {
        this.map.zoomTo(this.props.zoom);
      }
    }

  }

  initMap() {

    // 创建Map实例
    let options = this.options;
    options = this.getOptions(options);
    if (this.props.enableMapClick !== true) {
      options.enableMapClick = false;
    }

    let map = new BMap.Map(this.refs.map, options);

    this.map = map;

    if (this.props.mapStyle) {
      map.setMapStyle(this.props.mapStyle);
    }

    let zoom = this.props.zoom;

    // 在 centerAndZoom() 之前执行事件绑定否则load无法正常触发
    this.bindEvent(map, this.events);

    if (isString(this.props.center)) { // 可以传入城市名
      map.centerAndZoom(this.props.center);
    } else { // 正常传入经纬度坐标
      let center = new BMap.Point(this.props.center.lng, this.props.center.lat);
      map.centerAndZoom(center, zoom);  // 初始化地图,设置中心点坐标和地图级别
    }

    if (this.props.enableScrollWheelZoom) {
      map.enableScrollWheelZoom();
    }

    this.bindToggleMeghods(map, this.toggleMethods);

    let lastZoom = zoom;
    map.addEventListener('zoomend', () => {
      let zoom = map.getZoom();
      this.props.zoomChanged && this.props.zoomChanged(zoom, lastZoom);
      lastZoom = zoom;
    });

  }

  renderChildren() {

    const {children} = this.props;

    if (!children || !this.map) return;

    return React.Children.map(children, child => {

      if (!child) {
        return;
      }

      if (typeof child.type === 'string') {
        return child;
      } else {
        return React.cloneElement(child, {
          map: this.map
        });
      }

    })

  }

  onRender() {

    if (!this.props.render || !this.map) {
      return;
    }

    return this.props.render(this.map);
  }

  render() {
    let style = {
      height: '100%',
      position: 'relative'
    };
    for (let key in this.props.style) {
      style[key] = this.props.style[key];
    }
    return (
      <div style={style}>
        <div ref='map' className={this.props.className} style={{height: '100%'}}>
          加载地图中...
        </div>
        {this.renderChildren()}
        {this.onRender()}
      </div>
    );
  }
}
