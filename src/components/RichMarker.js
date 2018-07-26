import BMap from 'BMap';

var getEvent = function (type, target) {
  this.type = type;
  this.returnValue = true;
  this.target = target || null;
  this.currentTarget = null;
};

var RichMarker = function (position, content, opts) {
  if (!content || !position || !(position instanceof BMap.Point)) {
    return;
  }
  /**
   * map对象
   * @private
   * @type {Map}
   */
  this._map = null;

  /**
   * Marker内容
   * @private
   * @type {String | HTMLElement}
   */
  this._content = content;

  /**
   * marker显示位置
   * @private
   * @type {BMap.Point}
   */
  this._position = position;

  /**
   * marker主容器
   * @private
   * @type {HTMLElement}
   */
  this._container = null;

  /**
   * marker主容器的尺寸
   * @private
   * @type {BMap.Size}
   */
  this._size = null;

  opts = opts || {};
  /**
   * _opts是默认参数赋值。
   * 下面通过用户输入的opts，对默认参数赋值
   * @private
   * @type {Json}
   */
  this._opts = Object.assign(
    Object.assign(this._opts || {}, {

      /**
       * Marker是否可以拖拽
       * @private
       * @type {Boolean}
       */
      enableDragging: false,

      /**
       * Marker的偏移量
       * @private
       * @type {BMap.Size}
       */
      anchor: new BMap.Size(0, 0)
    }), opts);
};

// 继承覆盖物类
RichMarker.prototype = new BMap.Overlay();

/**
 * 初始化，实现自定义覆盖物的initialize方法
 * 主要生成Marker的主容器，填充自定义的内容，并附加事件
 *
 * @private
 * @param {BMap} map map实例对象
 * @return {Dom} 返回自定义生成的dom节点
 */
RichMarker.prototype.initialize = function (map) {
  var me = this,
    div = me._container = document.createElement("div");
  me._map = map;
  Object.assign(div.style, {
    position: "absolute",
    zIndex: BMap.Overlay.getZIndex(me._position.lat),
    cursor: "pointer"
  });
  map.getPanes().labelPane.appendChild(div);

  // 给主容器添加上用户自定义的内容
  me._appendContent();
  // 给主容器添加事件处理
  me._setEventDispath();
  // 获取主容器的高宽
  me._getContainerSize();

  return div;
};

/**
 * 为自定义的Marker设定显示位置，实现自定义覆盖物的draw方法
 *
 * @private
 */
RichMarker.prototype.draw = function () {
  var map = this._map,
    anchor = this._opts.anchor,
    pixel = map.pointToOverlayPixel(this._position);
  this._container.style.left = pixel.x + anchor.width + "px";
  this._container.style.top = pixel.y + anchor.height + "px";
};

/**
 * 设置Marker可以拖拽
 * @return 无返回值
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.enableDragging();
 */
RichMarker.prototype.enableDragging = function () {
  this._opts.enableDragging = true;
};

/**
 * 设置Marker不能拖拽
 * @return 无返回值
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.disableDragging();
 */
RichMarker.prototype.disableDragging = function () {
  this._opts.enableDragging = false;
};

/**
 * 获取Marker是否能被拖拽的状态
 * @return {Boolean} true为可以拖拽，false为不能被拖拽
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.isDraggable();
 */
RichMarker.prototype.isDraggable = function () {
  return this._opts.enableDragging;
};

/**
 * 获取Marker的显示位置
 * @return {BMap.Point} 显示的位置
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.getPosition();
 */
RichMarker.prototype.getPosition = function () {
  return this._position;
};

/**
 * 设置Marker的显示位置
 * @param {BMap.Point} position 需要设置的位置
 * @return 无返回值
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.setPosition(new BMap.Point(116.30816, 40.056863));
 */
RichMarker.prototype.setPosition = function (position) {
  if (!position instanceof BMap.Point) {
    return;
  }
  this._position = position;
  this.draw();
};

/**
 * 获取Marker的偏移量
 * @return {BMap.Size} Marker的偏移量
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.getAnchor();
 */
RichMarker.prototype.getAnchor = function () {
  return this._opts.anchor;
};

/**
 * 设置Marker的偏移量
 * @param {BMap.Size} anchor 需要设置的偏移量
 * @return 无返回值
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.setAnchor(new BMap.Size(-72, -84));
 */
RichMarker.prototype.setAnchor = function (anchor) {
  if (!anchor instanceof BMap.Size) {
    return;
  }
  this._opts.anchor = anchor;
  this.draw();
};

/**
 * 添加用户的自定义的内容
 *
 * @private
 * @return 无返回值
 */
RichMarker.prototype._appendContent = function () {
  var content = this._content;
  // 用户输入的内容是字符串，需要转化成dom节点
  if (typeof content === "string") {
    var div = document.createElement('DIV');
    div.innerHTML = content;
    if (div.childNodes.length === 1) {
      content = (div.removeChild(div.firstChild));
    } else {
      var fragment = document.createDocumentFragment();
      while (div.firstChild) {
        fragment.appendChild(div.firstChild);
      }
      content = fragment;
    }
  }
  this._container.innerHTML = "";
  this._container.appendChild(content);
};

/**
 * 获取Marker的内容
 * @return {String | HTMLElement} 当前内容
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.getContent();
 */
RichMarker.prototype.getContent = function () {
  return this._content;
};

/**
 * 设置Marker的内容
 * @param {String | HTMLElement} content 需要设置的内容
 * @return 无返回值
 *
 * @example <b>参考示例：</b>
 * var htm = "&lt;div style='background:#E7F0F5;color:#0082CB;border:1px solid #333'&gt;"
 *              +     "欢迎使用百度地图API！"
 *              +     "&lt;img src='http://map.baidu.com/img/logo-map.gif' border='0' /&gt;"
 *              + "&lt;/div&gt;";
 * myRichMarkerObject.setContent(htm);
 */
RichMarker.prototype.setContent = function (content) {
  if (!content) {
    return;
  }
  // 存储用户输入的Marker显示内容
  this._content = content;
  // 添加进主容器
  this._appendContent();
};

/**
 * 获取Marker的高宽
 *
 * @private
 * @return {BMap.Size} 当前高宽
 */
RichMarker.prototype._getContainerSize = function () {
  if (!this._container) {
    return;
  }
  var h = this._container.offsetHeight;
  var w = this._container.offsetWidth;
  this._size = new BMap.Size(w, h);
};

/**
 * 获取Marker的宽度
 * @return {Number} 当前宽度
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.getWidth();
 */
RichMarker.prototype.getWidth = function () {
  if (!this._size) {
    return;
  }
  return this._size.width;
};

/**
 * 设置Marker的宽度
 * @param {Number} width 需要设置的宽度
 * @return 无返回值
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.setWidth(300);
 */
RichMarker.prototype.setWidth = function (width) {
  if (!this._container) {
    return;
  }
  this._container.style.width = width + "px";
  this._getContainerSize();
};

/**
 * 获取Marker的高度
 * @return {Number} 当前高度
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.getHeight();
 */
RichMarker.prototype.getHeight = function () {
  if (!this._size) {
    return;
  }
  return this._size.height;
};

/**
 * 设置Marker的高度
 * @param {Number} height 需要设置的高度
 * @return 无返回值
 *
 * @example <b>参考示例：</b>
 * myRichMarkerObject.setHeight(200);
 */
RichMarker.prototype.setHeight = function (height) {
  if (!this._container) {
    return;
  }
  this._container.style.height = height + "px";
  this._getContainerSize();
};

/**
 * 设置Marker的各种事件
 *
 * @private
 * @return 无返回值
 */
RichMarker.prototype._setEventDispath = function () {
  var me = this,
    div = me._container,
    isMouseDown = false,
    // 鼠标是否按下，用以判断鼠标移动过程中的拖拽计算
    startPosition = null; // 拖拽时，鼠标按下的初始位置，拖拽的辅助计算参数

  // 通过e参数获取当前鼠标所在位置
  function _getPositionByEvent(e) {
    e = window.event || e;
    var x = e.pageX || e.clientX || 0,
      y = e.pageY || e.clientY || 0,
      pixel = new BMap.Pixel(x, y),
      point = me._map.pixelToPoint(pixel);
    return {
      "pixel": pixel,
      "point": point
    };
  }

  // 单击事件
  div.addEventListener("click", function (e) {
    /**
     * 点击Marker时，派发事件的接口
     * @name RichMarker#onclick
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("onclick", function(e) {
             *     alert(e.type);
             * });
     */
    _dispatchEvent(me, "click");
    _stopAndPrevent(e);
  }, false);

  // 单击事件
  div.addEventListener("touchend", function (e) {
    /**
     * 点击Marker时，派发事件的接口
     * @name RichMarker#onclick
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("onclick", function(e) {
             *     alert(e.type);
             * });
     */
    _dispatchEvent(me, "touchend");
    _dispatchEvent(me, "click");
    _stopAndPrevent(e);
  }, false);
  // 双击事件
  div.addEventListener("dblclick", function (e) {
    var position = _getPositionByEvent(e);
    /**
     * 双击Marker时，派发事件的接口
     * @name RichMarker#ondblclick
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型,
             * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
             * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("ondblclick", function(e) {
             *     alert(e.type);
             * });
     */
    _dispatchEvent(me, "dblclick", {
      "point": position.point,
      "pixel": position.pixel
    });
    _stopAndPrevent(e);
  }, false);

  // 鼠标移上事件
  div.onmouseover = function (e) {
    var position = _getPositionByEvent(e);
    /**
     * 鼠标移到Marker上时，派发事件的接口
     * @name RichMarker#onmouseover
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型,
             * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
             * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("onmouseover", function(e) {
             *     alert(e.type);
             * });
     */
    _dispatchEvent(me, "mouseover", {
      "point": position.point,
      "pixel": position.pixel
    });

    _stopAndPrevent(e);
  };

  // 鼠标移出事件
  div.onmouseout = function (e) {
    var position = _getPositionByEvent(e);
    /**
     * 鼠标移出Marker时，派发事件的接口
     * @name RichMarker#onmouseout
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型,
             * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
             * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("onmouseout", function(e) {
             *     alert(e.type);
             * });
     */
    _dispatchEvent(me, "mouseout", {
      "point": position.point,
      "pixel": position.pixel
    });
    _stopAndPrevent(e);
  };

  // 鼠标弹起事件
  var mouseUpEvent = function (e) {
    var position = _getPositionByEvent(e);
    /**
     * 在Marker上弹起鼠标时，派发事件的接口
     * @name RichMarker#onmouseup
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("onmouseup", function(e) {
                 *     alert(e.type);
                 * });
     */
    _dispatchEvent(me, "mouseup", {
      "point": position.point,
      "pixel": position.pixel
    });

    if (me._container.releaseCapture) {
      div.removeEventListener("mousemove", mouseMoveEvent, false);
      div.removeEventListener("mouseup", mouseUpEvent, false);
    } else {
      window.removeEventListener("mousemove", mouseMoveEvent, false);
      window.removeEventListener("mouseup", mouseUpEvent, false);
    }

    // 判断是否需要进行拖拽事件的处理
    if (!me._opts.enableDragging) {
      _stopAndPrevent(e);
      return;
    }
    // 拖拽结束时，释放鼠标捕获
    me._container.releaseCapture && me._container.releaseCapture();
    /**
     * 拖拽Marker结束时，派发事件的接口
     * @name RichMarker#ondragend
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("ondragend", function(e) {
                 *     alert(e.type);
                 * });
     */
    _dispatchEvent(me, "dragend", {
      "point": position.point,
      "pixel": position.pixel
    });
    isMouseDown = false;
    startPosition = null;
    // 设置拖拽结束后的鼠标手型
    me._setCursor("dragend");
    // 拖拽过程中防止文字被选中
    me._container.style['MozUserSelect'] = '';
    me._container.style['KhtmlUserSelect'] = '';
    me._container.style['WebkitUserSelect'] = '';
    me._container['unselectable'] = 'off';
    me._container['onselectstart'] = function () {
    };

    _stopAndPrevent(e);
  };

  // 鼠标移动事件
  var mouseMoveEvent = function (e) {
    // 判断是否需要进行拖拽事件的处理
    if (!me._opts.enableDragging || !isMouseDown) {
      return;
    }
    var position = _getPositionByEvent(e);

    // 计算当前marker应该所在的位置
    var startPixel = me._map.pointToPixel(me._position);
    var x = position.pixel.x - startPosition.x + startPixel.x;
    var y = position.pixel.y - startPosition.y + startPixel.y;

    startPosition = position.pixel;
    me._position = me._map.pixelToPoint(new BMap.Pixel(x, y));
    me.draw();
    // 设置拖拽过程中的鼠标手型
    me._setCursor("dragging");
    /**
     * 拖拽Marker的过程中，派发事件的接口
     * @name RichMarker#ondragging
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("ondragging", function(e) {
                 *     alert(e.type);
                 * });
     */
    _dispatchEvent(me, "dragging", {
      "point": position.point,
      "pixel": position.pixel
    });
    _stopAndPrevent(e);
  };

  // 鼠标按下事件
  div.addEventListener("mousedown", function (e) {
    var position = _getPositionByEvent(e);
    /**
     * 在Marker上按下鼠标时，派发事件的接口
     * @name RichMarker#onmousedown
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("onmousedown", function(e) {
                 *     alert(e.type);
                 * });
     */
    _dispatchEvent(me, "mousedown", {
      "point": position.point,
      "pixel": position.pixel
    });

    if (me._container.setCapture) {
      div.addEventListener("mousemove", mouseMoveEvent, false);
      div.addEventListener("mouseup", mouseUpEvent, false);
    } else {
      window.addEventListener("mousemove", mouseMoveEvent, false);
      window.addEventListener("mouseup", mouseUpEvent, false);
    }

    // 判断是否需要进行拖拽事件的处理
    if (!me._opts.enableDragging) {
      _stopAndPrevent(e);
      return;
    }
    startPosition = position.pixel;
    /**
     * 开始拖拽Marker时，派发事件的接口
     * @name RichMarker#ondragstart
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>target</b> : {BMap.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMap.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMap.Pixel} 鼠标的像素坐标}
     *
     * @example <b>参考示例：</b>
     * myRichMarkerObject.addEventListener("ondragstart", function(e) {
                 *     alert(e.type);
                 * });
     */
    _dispatchEvent(me, "dragstart", {
      "point": position.point,
      "pixel": position.pixel
    });
    isMouseDown = true;
    // 设置拖拽开始的鼠标手型
    me._setCursor("dragstart");
    // 拖拽开始时，设置鼠标捕获
    me._container.setCapture && me._container.setCapture();
    // 拖拽过程中防止文字被选中
    me._container.style['MozUserSelect'] = 'none';
    me._container.style['KhtmlUserSelect'] = 'none';
    me._container.style['WebkitUserSelect'] = 'none';
    me._container['unselectable'] = 'on';
    me._container['onselectstart'] = function () {
      return false;
    };
    _stopAndPrevent(e);
  }, false);
};

/**
 * 设置拖拽过程中的手型
 *
 * @private
 * @param {string} cursorType 需要设置的手型类型
 */
RichMarker.prototype._setCursor = function (cursorType) {
  var cursor = '';
  var cursorStylies = {
    "moz": {
      "dragstart": "-moz-grab",
      "dragging": "-moz-grabbing",
      "dragend": "pointer"
    },
    "other": {
      "dragstart": "move",
      "dragging": "move",
      "dragend": "pointer"
    }
  };

  if (navigator.userAgent.indexOf('Gecko/') !== -1) {
    cursor = cursorStylies.moz[cursorType];
  } else {
    cursor = cursorStylies.other[cursorType];
  }

  if (this._container.style.cursor !== cursor) {
    this._container.style.cursor = cursor;
  }
};

/**
 * 删除Marker
 *
 * @private
 * @return 无返回值
 */
RichMarker.prototype.remove = function () {
  _dispatchEvent(this, "remove");
  // 清除主容器上的事件绑定
  if (this._container) {
    _purge(this._container);
  }
  // 删除主容器
  if (this._container && this._container.parentNode) {
    this._container.parentNode.removeChild(this._container);
  }
};

/**
 * 集中派发事件函数
 *
 * @private
 * @param {Object} instance 派发事件的实例
 * @param {String} type 派发的事件名
 * @param {Json} opts 派发事件里添加的参数，可选
 */
function _dispatchEvent(instance, type, opts) {
  var event = new getEvent(type);
  if (!!opts) {
    for (var p in opts) {
      event[p] = opts[p];
    }
  }
  instance.dispatchEvent(event);
}

/**
 * 清理DOM事件，防止循环引用
 *
 * @type {DOM} dom 需要清理的dom对象
 */
function _purge(dom) {
  if (!dom) {
    return;
  }
  var attrs = dom.attributes,
    name = "";
  if (attrs) {
    for (var i = 0, n = attrs.length; i < n; i++) {
      name = attrs[i].name;
      if (typeof dom[name] === "function") {
        dom[name] = null;
      }
    }
  }
  var child = dom.childnodes;
  if (child) {
    i = 0;
    n = child.length;
    for (; i < n; i++) {
      _purge(dom.childnodes[i]);
    }
  }
}

/**
 * 停止事件冒泡传播
 *
 * @type {Event} e e对象
 */
function _stopAndPrevent(e) {
  e = window.event || e;
  e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true);
  e.preventDefault ? e.preventDefault() : (e.returnValue = false);
  return e;
}

export default RichMarker;
