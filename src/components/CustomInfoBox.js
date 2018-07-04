import BMap from 'BMap';

var getEvent = function (type, target) {
  this.type = type;
  this.returnValue = true;
  this.target = target || null;
  this.currentTarget = null;
};

var toCamelCase = function (source) {
  if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
    return source;
  }
  return source.replace(/[-_][^-_]/g, function (match) {
    return match.charAt(1).toUpperCase();
  });
};

var setStyles = function (element, styles) {
  for (var key in styles) {
    element.style[toCamelCase(key)] = styles[key];
  }
  return element;
};

var createElement = function (tagName, attributes) {
  var el = document.createElement(tagName);
  attributes = attributes || {};
  for (var i in attributes) {
    el.setAttribute(i, attributes[i]);
  }

  return el;
};

var InfoBox = function (map, content, opts) {

  this._content = content || "";
  this._isOpen = false;
  this._map = map;

  this._opts = opts = opts || {};
  this._opts.offset = opts.offset || new BMap.Size(0, 0);
  this._opts.boxClass = opts.boxClass || "infoBox";
  this._opts.boxStyle = opts.boxStyle || {};
  this._opts.closeIconMargin = opts.closeIconMargin || "2px";
  this._opts.enableAutoPan = opts.enableAutoPan ? true : false;
  this._opts.align = opts.align || InfoBox.INFOBOX_AT_TOP;
};

//常量，infoBox可以出现的位置，此版本只可实现上下两个方向。
InfoBox.INFOBOX_AT_TOP = 1;
InfoBox.INFOBOX_AT_RIGHT = 2;
InfoBox.INFOBOX_AT_BOTTOM = 3;
InfoBox.INFOBOX_AT_LEFT = 4;

InfoBox.prototype = new BMap.Overlay();
InfoBox.prototype.initialize = function (map) {
  var me = this;
  var div = this._div = createElement('div', {"class": this._opts.boxClass});
  setStyles(div, this._opts.boxStyle);
  //设置position为absolute，用于定位
  div.style.position = "absolute";
  this._setContent(this._content);

  var floatPane = map.getPanes().floatPane;
  floatPane.style.width = "auto";
  floatPane.appendChild(div);
  //设置完内容后，获取div的宽度,高度
  this._getInfoBoxSize();
  //this._boxWidth = parseInt(this._div.offsetWidth,10);
  //this._boxHeight = parseInt(this._div.offsetHeight,10);
  //阻止各种冒泡事件
  div.addEventListener("mousedown", function (e) {
    me._stopBubble(e);
  }, false);

  div.addEventListener("mouseover", function (e) {
    me._stopBubble(e);
  }, false);

  div.addEventListener("click", function (e) {
    me._stopBubble(e);
  }, false);

  div.addEventListener("dblclick", function (e) {
    me._stopBubble(e);
  }, false);

  return div;
};
InfoBox.prototype.draw = function () {
  this._isOpen && this._adjustPosition(this._point);
};

InfoBox.prototype.open = function (anchor) {
  var me = this, poi;
  if (!this._isOpen) {
    this._map.addOverlay(this);
    this._isOpen = true;
    //延迟10ms派发open事件，使后绑定的事件可以触发。
    setTimeout(function () {
      me._dispatchEvent(me, "open", {"point": me._point});
    }, 10);
  }
  if (anchor instanceof BMap.Point) {
    poi = anchor;
    //清除之前存在的marker事件绑定，如果存在的话
    this._removeMarkerEvt();
  } else if (anchor instanceof BMap.Marker) {
    //如果当前marker不为空，说明是第二个marker，或者第二次点open按钮,先移除掉之前绑定的事件
    if (this._marker) {
      this._removeMarkerEvt();
    }
    poi = anchor.getPosition();
    this._marker = anchor;
    !this._markerDragend && this._marker.addEventListener("dragend", this._markerDragend = function (e) {
      me._point = e.point;
      me._adjustPosition(me._point);
      me._panBox();
      me.show();
    });
    //给marker绑定dragging事件，拖动marker的时候，infoBox也跟随移动
    !this._markerDragging && this._marker.addEventListener("dragging", this._markerDragging = function () {
      me.hide();
      me._point = me._marker.getPosition();
      me._adjustPosition(me._point);
    });
  }
  //打开的时候，将infowindow显示
  this.show();
  this._point = poi;
  this._panBox();
  this._adjustPosition(this._point);
};

InfoBox.prototype.close = function () {
  if (this._isOpen) {
    this._map.removeOverlay(this);
    this._remove();
    this._isOpen = false;
    this._dispatchEvent(this, "close", {"point": this._point});
  }
};

/**
 * 启用自动平移
 * @return none
 *
 * @example <b>参考示例：</b><br />
 * infoBox.enableAutoPan();
 */
InfoBox.prototype.enableAutoPan = function () {
  this._opts.enableAutoPan = true;
};
/**
 * 禁用自动平移
 * @return none
 *
 * @example <b>参考示例：</b><br />
 * infoBox.disableAutoPan();
 */
InfoBox.prototype.disableAutoPan = function () {
  this._opts.enableAutoPan = false;
};
/**
 * 设置infoBox的内容
 * @param {String|HTMLElement} content 弹出气泡中的内容
 * @return none
 *
 * @example <b>参考示例：</b><br />
 * infoBox.setContent("百度地图API");
 */
InfoBox.prototype.setContent = function (content) {
  this._setContent(content);
  this._getInfoBoxSize();
  this._adjustPosition(this._point);
};
/**
 * 设置信息窗的地理位置
 * @param {Point} point 设置position
 * @return none
 *
 * @example <b>参考示例：</b><br />
 * infoBox.setPosition(new BMap.Point(116.35,39.911));
 */
InfoBox.prototype.setPosition = function (poi) {
  this._point = poi;
  this._adjustPosition(poi);
  this._removeMarkerEvt();
};
/**
 * 获得信息窗的地理位置
 * @param none
 * @return {Point} 信息窗的地理坐标
 *
 * @example <b>参考示例：</b><br />
 * infoBox.getPosition();
 */
InfoBox.prototype.getPosition = function () {
  return this._point;
};
/**
 * 返回信息窗口的箭头距离信息窗口在地图
 * 上所锚定的地理坐标点的像素偏移量。
 * @return {Size} Size
 *
 * @example <b>参考示例：</b><br />
 * infoBox.getOffset();
 */
InfoBox.prototype.getOffset = function () {
  return this._opts.offset;
};
/**
 *@ignore
 * 删除overlay，调用Map.removeOverlay时将调用此方法，
 * 将移除覆盖物的容器元素
 */
InfoBox.prototype._remove = function () {
  var me = this;
  if (this.domElement && this.domElement.parentNode) {
    this.domElement.parentNode.removeChild(this.domElement);
  }
  this.domElement = null;
  this._isOpen = false;
  this.dispatchEvent("onremove");
};

Object.assign(InfoBox.prototype, {
  /**
   * 设置infoBox的内容
   * @param {String|HTMLElement} content 弹出气泡中的内容
   * @return none
   *
   * @example <b>参考示例：</b><br />
   * infoBox.setContent("百度地图API");
   */
  _setContent: function (content) {
    if (!this._div) {
      return;
    }
    //string类型的content
    if (typeof content.nodeType === "undefined") {
      this._div.innerHTML = content;
    } else {
      this._div.appendChild(content);
    }
    this._content = content;

  },
  /**
   * 调整infobox的position
   * @return none
   */
  _adjustPosition: function (poi) {
    var pixel = this._getPointPosition(poi);
    var icon = this._marker && this._marker.getIcon();
    switch (this._opts.align) {
      case InfoBox.INFOBOX_AT_TOP:
        if (this._marker) {
          this._div.style.bottom = -(pixel.y - this._opts.offset.height - icon.anchor.height + icon.infoWindowAnchor.height) - this._marker.getOffset().height + 2 + "px";
        } else {
          this._div.style.bottom = -(pixel.y - this._opts.offset.height) + "px";
        }
        break;
      case InfoBox.INFOBOX_AT_BOTTOM:
        if (this._marker) {
          this._div.style.top = pixel.y + this._opts.offset.height - icon.anchor.height + icon.infoWindowAnchor.height + this._marker.getOffset().height + "px";
        } else {
          this._div.style.top = pixel.y + this._opts.offset.height + "px";
        }
        break;
      default:
    }

    if (this._marker) {
      this._div.style.left = pixel.x + this._opts.offset.width - icon.anchor.width + this._marker.getOffset().width + icon.infoWindowAnchor.width - this._boxWidth / 2 + "px";
    } else {
      this._div.style.left = pixel.x + this._opts.offset.width - this._boxWidth / 2 + "px";
    }
  },
  /**
   * 得到infobox的position
   * @return Point  infobox当前的position
   */
  _getPointPosition: function (poi) {
    this._pointPosition = this._map.pointToOverlayPixel(poi);
    return this._pointPosition;
  },
  /**
   * 得到infobox的高度跟宽度
   * @return none
   */
  _getInfoBoxSize: function () {
    this._boxWidth = parseInt(this._div.offsetWidth, 10);
    this._boxHeight = parseInt(this._div.offsetHeight, 10);
  },
  /**
   * 阻止事件冒泡
   * @return none
   */
  _stopBubble: function (e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    } else {
      window.event.cancelBubble = true;
    }
  },
  /**
   * 自动平移infobox，使其在视野中全部显示
   * @return none
   */
  _panBox: function () {
    if (!this._opts.enableAutoPan) {
      return;
    }
    var mapH = parseInt(this._map.getContainer().offsetHeight, 10),
      mapW = parseInt(this._map.getContainer().offsetWidth, 10),
      boxH = this._boxHeight,
      boxW = this._boxWidth;
    //infobox窗口本身的宽度或者高度超过map container
    if (boxH >= mapH || boxW >= mapW) {
      return;
    }
    //如果point不在可视区域内
    if (!this._map.getBounds().containsPoint(this._point)) {
      this._map.setCenter(this._point);
    }
    var anchorPos = this._map.pointToPixel(this._point),
      panTop, panBottom, panX, panY, h,
      //左侧超出
      panLeft = boxW / 2 - anchorPos.x,
      //右侧超出
      panRight = boxW / 2 + anchorPos.x - mapW;
    if (this._marker) {
      var icon = this._marker.getIcon();
    }
    //基于bottom定位，也就是infoBox在上方的情况
    switch (this._opts.align) {
      case InfoBox.INFOBOX_AT_TOP:
        //上侧超出
        h = this._marker ? icon.anchor.height + this._marker.getOffset().height - icon.infoWindowAnchor.height : 0;
        panTop = boxH - anchorPos.y + this._opts.offset.height + h + 2;
        break;
      case InfoBox.INFOBOX_AT_BOTTOM:
        //下侧超出
        h = this._marker ? -icon.anchor.height + icon.infoWindowAnchor.height + this._marker.getOffset().height + this._opts.offset.height : 0;
        panBottom = boxH + anchorPos.y - mapH + h + 4;
        break;
      default:
    }

    panX = panLeft > 0 ? panLeft : (panRight > 0 ? -panRight : 0);
    panY = panTop > 0 ? panTop : (panBottom > 0 ? -panBottom : 0);
    this._map.panBy(panX, panY);
  },
  _removeMarkerEvt: function () {
    this._markerDragend && this._marker.removeEventListener("dragend", this._markerDragend);
    this._markerDragging && this._marker.removeEventListener("dragging", this._markerDragging);
    this._markerDragend = this._markerDragging = null;
  },
  /**
   * 集中派发事件函数
   *
   * @private
   * @param {Object} instance 派发事件的实例
   * @param {String} type 派发的事件名
   * @param {Json} opts 派发事件里添加的参数，可选
   */
  _dispatchEvent: function (instance, type, opts) {
    type.indexOf("on") !== 0 && (type = "on" + type);
    var event = new getEvent(type);
    if (!!opts) {
      for (var p in opts) {
        event[p] = opts[p];
      }
    }
    instance.dispatchEvent(event);
  }
});

export default InfoBox;
