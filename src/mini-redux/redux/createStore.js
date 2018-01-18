export default function createStore(reducer, preloadedState, enhancer) {
  // preloadedState参数可以省略，此时enhancer作为第二个参数
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }
  // enhancer需要为函数类型
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }
    // 用enhancer增强redux
    return enhancer(createStore)(reducer, preloadedState);
  }
  // reducer需要为函数类型
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  let currentState = {};
  let currentListeners = [];

  function getState() {
    return currentState;
  }

  function subscribe(listener) {
    currentListeners.push(listener);
  }

  function dispatch(action) {
    currentState = reducer(currentState, action);
    currentListeners.forEach(v => v());
    return action;
  }

  dispatch({type: '@redux/init'});

  return { getState, subscribe, dispatch };
}