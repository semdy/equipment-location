/**
 * @file 地图标注组件
 * @author kyle(hinikai@gmail.com)
 */

import React from 'react';
import {render} from 'react-dom';
import Component from './component';
import RichMarker from './RichMarker';
import BMap from 'BMap';

const defaultIconUrl = 'http://webmap1.map.bdstatic.com/wolfman/static/common/images/markers_new2x_fbb9e99.png';

var icons = {
  'simple_red': new BMap.Icon(defaultIconUrl, new BMap.Size(42 / 2, 66 / 2), {
    imageOffset: new BMap.Size(-454 / 2, -378 / 2),
    anchor: new BMap.Size(42 / 2 / 2, 66 / 2),
    imageSize: new BMap.Size(600 / 2, 600 / 2)
  }),
  'simple_blue': new BMap.Icon(defaultIconUrl, new BMap.Size(42 / 2, 66 / 2), {
    imageOffset: new BMap.Size(-454 / 2, -450 / 2),
    anchor: new BMap.Size(42 / 2 / 2, 66 / 2),
    imageSize: new BMap.Size(600 / 2, 600 / 2)
  }),
  'loc_red': new BMap.Icon(defaultIconUrl, new BMap.Size(46 / 2, 70 / 2), {
    imageOffset: new BMap.Size(-400 / 2, -378 / 2),
    anchor: new BMap.Size(46 / 2 / 2, 70 / 2),
    imageSize: new BMap.Size(600 / 2, 600 / 2)
  }),
  'loc_blue': new BMap.Icon(defaultIconUrl, new BMap.Size(46 / 2, 70 / 2), {
    imageOffset: new BMap.Size(-400 / 2, -450 / 2),
    anchor: new BMap.Size(46 / 2 / 2, 70 / 2),
    imageSize: new BMap.Size(600 / 2, 600 / 2)
  }),
  'start': new BMap.Icon(defaultIconUrl, new BMap.Size(50 / 2, 80 / 2), {
    imageOffset: new BMap.Size(-400 / 2, -278 / 2),
    anchor: new BMap.Size(50 / 2 / 2, 80 / 2),
    imageSize: new BMap.Size(600 / 2, 600 / 2)
  }),
  'end': new BMap.Icon(defaultIconUrl, new BMap.Size(50 / 2, 80 / 2), {
    imageOffset: new BMap.Size(-450 / 2, -278 / 2),
    anchor: new BMap.Size(50 / 2 / 2, 80 / 2),
    imageSize: new BMap.Size(600 / 2, 600 / 2)
  })
};

for (let i = 1; i <= 10; i++) {
  icons['red' + i] = new BMap.Icon(defaultIconUrl, new BMap.Size(42 / 2, 66 / 2), {
    imageOffset: new BMap.Size(0 - 42 / 2 * (i - 1), 0),
    anchor: new BMap.Size(42 / 2 / 2, 66 / 2 / 2),
    imageSize: new BMap.Size(600 / 2, 600 / 2)
  });
}

export default class App extends Component {

  constructor(args) {
    super(args);
    this.state = {};
  }

  /**
   * 设置默认的props属性
   */
  static get defaultProps() {
    return {
      position: {},
      icon: null,
      enableDragging: false,

      /**
       * Marker的偏移量
       * @private
       * @type {BMap.Size}
       */
      offset: new BMap.Size(0, 0)
    }
  }

  /**
   * 获取可以给marker绑定的事件名
   */
  get events() {
    return [
      'click',
      'dblclick',
      'mousedown',
      'mouseup',
      'mouseout',
      'mouseover',
      'remove',
      'infowindowclose',
      'infowindowopen',
      'dragstart',
      'dragging',
      'dragend',
      'rightclick'
    ];
  }

  get toggleMethods() {
    return {
      enableMassClear: ['enableMassClear', 'disableMassClear'],
      enableDragging: ['enableDragging', 'disableDragging']
    }
  }

  get options() {
    return [
      'offset',
      'icon',
      'enableMassClear',
      'enableDragging',
      'enableClicking',
      'raiseOnDrag',
      'draggingCursor',
      'rotation',
      'shadow',
      'title'
    ];
  }

  componentDidUpdate(prevProps) {
    this.initialize();
  }

  componentDidMount() {
    this.initialize();
  }

  componentWillUnmount() {
    this.destroy();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { icon, position, enableDragging } = this.props;

    if (
      icon !== nextProps.icon
      || enableDragging !== nextProps.enableDragging
    ) {
      return true;
    }

    for(let i in nextProps.position) {
      if (nextProps.position[i] !== position[i]) {
        return true;
      }
    }

    return false
  }

  destroy() {
    if (this.props.mgr) {
      this.props.mgr.removeMarker(this.marker)
    } else {
      this.props.map.removeOverlay(this.marker);
    }
    this.marker = null;
  }

  initialize() {
    let map = this.props.map;
    if (!map) {
      return;
    }

    this.destroy();

    const {
      children, coordType, position, enableDragging,
      offset, mgr, autoViewport, autoCenterAndZoom, centerAndZoomOptions
    } = this.props;

    let newPosition;
    if (coordType === 'bd09mc') {
      let projection = map.getMapType().getProjection();
      newPosition = projection.pointToLngLat(new BMap.Pixel(position.lng, position.lat));
    } else {
      newPosition = new BMap.Point(position.lng, position.lat);
    }

    if (children) {
      this.contentDom = document.createElement('div');
      render(<div>{children}</div>, this.contentDom);

      this.marker = new RichMarker(newPosition, this.contentDom, {
        enableDragging: enableDragging,
        anchor: offset
      });

      this.bindEvent(this.marker, this.events);

      if (mgr) {
        mgr.addMarker(this.marker);
      } else {
        map.addOverlay(this.marker);
      }
    } else {
      let icon;
      let propsIcon = this.props.icon;

      if (propsIcon) {
        if (propsIcon instanceof BMap.Icon) {
          icon = propsIcon;
        }
        else if (icons[propsIcon]) {
          icon = icons[propsIcon];
        }
      }

      let options = this.getOptions(this.options);
      options.icon = icon;
      this.marker = new BMap.Marker(newPosition, options);
      if (this.props.isTop) {
        this.marker.setTop(true);
      }

      this.bindEvent(this.marker, this.events);

      if (mgr) {
        mgr.addMarker(this.marker);
      } else {
        map.addOverlay(this.marker);
      }

      this.bindToggleMeghods(this.marker, this.toggleMethods);
    }

    if (autoViewport) {
      map.panTo(newPosition);
    }

    if (autoCenterAndZoom) {
      map.setViewport([newPosition], centerAndZoomOptions);
    }
  }

}
