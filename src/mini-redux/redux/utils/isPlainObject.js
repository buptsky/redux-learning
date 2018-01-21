/**
 * @param {any} obj 待检查的对象
 * @returns {boolean} 如果参数表现为一个简单对象，返回true
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  // 将obj赋给proto
  let proto = obj;
  // 如果proto存在原型对象，将原型对象赋给proto，向上查找直到不具有原型对象为止
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  // 判断此时obj的原型对象是否为proto
  return Object.getPrototypeOf(obj) === proto;
}