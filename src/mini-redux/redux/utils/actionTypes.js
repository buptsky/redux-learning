/**
 * 这些是redux私有的action类型。
 * 对于任何未识别的action类型，你都需要返回当前的状态。
 * 如果当前的状态是undefined, 你必须返回初始状态。
 * 不要在程序里直接引用这些action类型。
 */
const ActionTypes = {
  INIT:
  '@@redux/INIT' +
  Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.'),
  REPLACE:
  '@@redux/REPLACE' +
  Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.')
}

export default ActionTypes