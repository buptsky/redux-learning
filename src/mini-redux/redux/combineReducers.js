import ActionTypes from './utils/actionTypes'
import warning from './utils/warning'
import isPlainObject from './utils/isPlainObject'
// 当reducer函数返回了undefind时的错误处理
function getUndefinedStateErrorMessage(key, action) {
  // 获取action的类型
  const actionType = action && action.type;
  // 获取antion类型的描述
  const actionDescription =
    (actionType && `action "${String(actionType)}"`) || 'an action';

  return (
    `Given ${actionDescription}, reducer "${key}" returned undefined. ` +
    `To ignore an action, you must explicitly return the previous state. ` +
    `If you want this reducer to hold no value, you can return null instead of undefined.`
  );
}
// 检测传入reducers的参数是否正确
function getUnexpectedStateShapeWarningMessage(
  inputState,
  reducers,
  action,
  unexpectedKeyCache
) {
  const reducerKeys = Object.keys(reducers);
  // 判断当前的action是初始化时系统自动派发还是用户主动派发
  const argumentName =
    action && action.type === ActionTypes.INIT
      ? 'preloadedState argument passed to createStore'
      : 'previous state received by the reducer';
  // store不存在任何reducer
  if (reducerKeys.length === 0) {
    return (
      'Store does not have a valid reducer. Make sure the argument passed ' +
      'to combineReducers is an object whose values are reducers.'
    )
  }
  // 传入的state不为简单对象时，返回警告信息
  if (!isPlainObject(inputState)) {
    return (
      `The ${argumentName} has unexpected type of "` +
      {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] +
      `". Expected argument to be an object with the following ` +
      `keys: "${reducerKeys.join('", "')}"`
    );
  }
  // 如果输入的state中含有reducer集合中不具有的key，储存这个key值
  const unexpectedKeys = Object.keys(inputState).filter(
    key => !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]
  );

  unexpectedKeys.forEach(key => {
    unexpectedKeyCache[key] = true;
  });
  // 如果要替换reducer，直接返回
  if (action && action.type === ActionTypes.REPLACE) return;
  // 返回警告信息
  if (unexpectedKeys.length > 0) {
    return (
      `Unexpected ${unexpectedKeys.length > 1 ? 'keys' : 'key'} ` +
      `"${unexpectedKeys.join('", "')}" found in ${argumentName}. ` +
      `Expected to find one of the known reducer keys instead: ` +
      `"${reducerKeys.join('", "')}". Unexpected keys will be ignored.`
    );
  }
}
// 检测reducer子函数是否符合要求
function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(key => {
    const reducer = reducers[key];
    // 向reducer函数传入值为undefined的state以及不会被用户自定义的action类型
    const initialState = reducer(undefined, { type: ActionTypes.INIT });
    // 如果返回的state为undefined，抛出错误
    if (typeof initialState === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined during initialization. ` +
        `If the state passed to the reducer is undefined, you must ` +
        `explicitly return the initial state. The initial state may ` +
        `not be undefined. If you don't want to set a value for this reducer, ` +
        `you can use null instead of undefined.`
      );
    }
    // 生成一个随机type的action
    const type =
      '@@redux/PROBE_UNKNOWN_ACTION_' +
      Math.random()
        .toString(36)
        .substring(7)
        .split('')
        .join('.');
    // 再次检测一次返回值是否为undefined，防止ActionTypes.INIT被用户恰好自定义
    if (typeof reducer(undefined, { type }) === 'undefined') {
      throw new Error(
        `Reducer "${key}" returned undefined when probed with a random type. ` +
        `Don't try to handle ${
          ActionTypes.INIT
          } or other actions in "redux/*" ` +
        `namespace. They are considered private. Instead, you must return the ` +
        `current state for any unknown actions, unless it is undefined, ` +
        `in which case you must return the initial state, regardless of the ` +
        `action type. The initial state may not be undefined, but can be null.`
      )
    }
  })
}

/**
 * 将值为各个不同reducer方法的对象,转化为一个单一reducer方法。
 * 它将调用所有子reducer方法, 并将结果
 * 合并为一个state对象, 该state对象的key
 * 与传入的reducer方法一一对应。
 *
 * @param {Object} reducers 一个值与需要合并的不同reducer函数相对应的对象。
 * 一种简便生成的方法是使用ES6`import * as reducers`的语法。
 * reducer函数在处理任何action时都不能返回undefined，
 * 如果传递给reducer的state是undefined,应该使用reducer的初始状态作为其参数。
 * 如果传递给reducer的action无法识别，应该返回当前的状态。
 *
 * @returns {Function} 一个根据参数对象调用每个reducer子函数的合成reducer函数，
 * 并按照相同结构构建一个状态对象。
 */
export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};
  // 遍历reducers，进行错误检测
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    // 开发环境下错误检测
    if (process.env.NODE_ENV !== 'production') {
      // 子reducer不能为undefined
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`);
      }
    }
    // 过滤得到符合要求的reducer集合
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  const finalReducerKeys = Object.keys(finalReducers);

  let unexpectedKeyCache;
  // 只有开发环境中会只用这个缓存键值的变量
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {};
  }

  let shapeAssertionError;
  // 检测reducer子函数是否符合要求
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination(state = {}, action) {
    // 如果前述检查发生错误，抛出错误
    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if (process.env.NODE_ENV !== 'production') {
      // 检测传入的参数是否正确
      const warningMessage = getUnexpectedStateShapeWarningMessage(
        state,
        finalReducers,
        action,
        unexpectedKeyCache
      );
      // 打印警告信息
      if (warningMessage) {
        warning(warningMessage);
      }
    }
    // 标记state是否改变
    let hasChanged = false;
    const nextState = {};
    // 遍历reducers
    for (let i = 0; i < finalReducerKeys.length; i++) {
      // 获取reducer的key和value
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      // 获取之前对应这个key的state值
      const previousStateForKey = state[key];
      // 为reducer函数传入action进行处理，返回下一个state
      const nextStateForKey = reducer(previousStateForKey, action);
      // 如果返回的状态为undefined
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      // 构建下一个状态树
      nextState[key] = nextStateForKey;
      // 记录状态树是否发生了改变
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    // 如果状态已经发生改变，返回下一个状态树
    return hasChanged ? nextState : state;
  }
}