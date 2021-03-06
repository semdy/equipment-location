
/**
 * 判断是否为字符串
 * @param {String} 判断对象
 * @return {Boolean}
 */
export const isString = function (str) {
    return Object.prototype.toString.call(str) === "[object String]";
};

/**
 * 格式化时间
 * @param  {source} source 时间对象
 * @param  {String} format 格式
 * @return {String}        格式化过后的时间
 */
export const formatDate = function (source, format) {
  if (!(source instanceof Date)) {
    source = new Date(source);
  }
  const o = {
    'M+': source.getMonth() + 1, // 月份
    'd+': source.getDate(), // 日
    'H+': source.getHours(), // 小时
    'm+': source.getMinutes(), // 分
    's+': source.getSeconds(), // 秒
    'q+': Math.floor((source.getMonth() + 3) / 3), // 季度
    'f+': source.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (source.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return format
}

export const caclTotal = function (array, key) {
  if (!Array.isArray(array) || array.length === 0) {
    return 0
  }
  return array.map(_ => Number(key ? _[key] : _)).reduce((a, b) => a + b)
}
