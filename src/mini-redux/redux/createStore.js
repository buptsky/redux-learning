/*
 * 2018/1/19 buptsky 理解性注释
 */
import $$observable from 'symbol-observable';

import ActionTypes from './utils/actionTypes';
import isPlainObject from './utils/isPlainObject';
/**
 * 创建一个 Redux store 来保存状态树。
 * 改变store中数据的唯一方法是调用store的`dispatch()`方法。
 *
 * 你的应用中应该只有一个store。为了指定状态树中不同部分的对于action的响应，
 * 你可以通过`combineReducers`方法将多个reducer组合成一个reducer函数。
 *
 * @param {Function} reducer 用于返回下一个状态树的函数，其参数是应用的当前状态树以及
 * 要处理的action。
 *
 * @param {any} [preloadedState] store的初始状态。你可以选择性的指定它与从服务器返回的状态结合，
 * 或者恢复一个先前的用户会话。
 * 如果你使用了`combineReducers`方法来生成根reducer函数。那么这个初始状态对象的
 * 结构必须与调用`combineReducers`方法时传入的参数的结构保持对应关系。
 *
 * @param {Function} enhancer store增强器。你可以选择性的传入一个增强函数来扩展
 * store的功能，例如中间件，时间旅行，持久化等。Redux自带的唯一一个增强器是
 * `applyMiddleware()`方法。
 *
 * @returns {Store} 返回一个Redux store让你可以读取状态，发送actions以及订阅变更。
 */

export default function createStore(reducer, preloadedState, enhancer) {
  // preloadedState参数可以省略，此时enhancer作为第二个参数
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }
  // 如果存在enhancer，需要为一个函数
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
  // 储存当前的reducer state listeners(监听队列)
  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = [];
  // 储存下一个监听队列
  let nextListeners = currentListeners;
  let isDispatching = false;

  // 复制当前监听队列到下一个监听队列
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * 通过store读取状态树
   *
   * @returns {any} 当前应用的状态树
   */
  function getState() {
    // 不能在reducer执行时使用此方法, reducer的参数中已经包含了当前应用的状态
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
        'The reducer has already received the state as an argument. ' +
        'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState;
  }

  /**
   * 新增一个变更监听函数。 每当dispatch了一个action之后监听函数都会被触发一次,
   * 此时状态树中的某些部分可能已经发生改变。 你可以在监听回调函数中调用
   * `getState()` 来获取最新状态。
   *
   * 你可以在回调函数中使用dispatch方法,
   * 但要注意以下几点:
   *
   * 1. 在每一次dispatch调用执行之前，监听队列都会被复制一份（通过前述的ensureCanMutateNextListeners方法）。
   * 如果你在监听函数中添加或删除其他监听函数,
   * 这不会对当前进行中的dispatch产生影响。
   * 然而, 当下一次dispatch方法调用, 不论其是否嵌套使用,
   * 都会使用最新的监听队列。
   *
   * 2. 监听器可能无法监测到所有的状态变更, 这是由于在监听函数被调用之前，
   * 状态可能已经在嵌套调用dispatch时更新了多次。
   * 然而，可以确定的是, 所有在dispatch之前注册的监听器都可以在其结束时获得最新的状态。
   *
   * @param {Function} 在每次dispatch之后的监听回掉函数。
   * @returns {Function} 返回一个取消此监听器的函数。
   */
  function subscribe(listener) {
    // 监听器需要为一个函数
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }
    // 不能在reducer执行的时候调用subscribe订阅方法
    // 如果你想在store发生改变后得到通知，可以在组件中调用subscribe方法，并在回调中使用 store.getState() 获得最新状态
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
        'If you would like to be notified after the store has been updated, subscribe from a ' +
        'component and invoke store.getState() in the callback to access the latest state. ' +
        'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
      );
    }
    // 标记当前监听器是否已经取消订阅
    let isSubscribed = true;
    // 生成监听队列的副本，并推入监听器
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    // 返回用于取消监听的函数
    return function unsubscribe() {
      // 防止重复解除监听
      if (!isSubscribed) {
        return;
      }
      // 在reducer执行时不能取消监听
      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
          'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
        );
      }
      // 标记监听已经取消
      isSubscribed = false;
      // 生成监听队列的副本，并移除监听器
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    }
  }

  /**
   * 派发一个action。这是触发状态改变的唯一方法。
   *
   * 派发一个action时，用于创建store的reducer函数会被调用一次，
   * 传入的参数是当前的状态以及被发送的action。函数返回的值被当作
   * 下一个状态, 随后监听器函数将被触发。
   *
   * 基础实现仅支持派发简单对象的action。如果你想
   * 派发一个 Promise, Observable, thunk,或其他形式的action, 你需要
   * 你需要用相应的中间件把store的创建函数包装起来。
   * 例如, 你可以查阅`redux-thunk`模块的文档。 即使是
   * 中间件最终还是会使用此方法发送简单对象的action。
   *
   * @param {Object} action 一个表示变更内容的简单对象。
   * 保证action可序列化是一个很好的实践， 这样你就可以记录和回放用户的操作，
   * 或者可以使用时间旅行的 `redux-devtools`插件。一个action必须有一个值不为
   * `undefined`的`type`属性。 推荐使用字符串常量来表示action类型。
   *
   * @returns {Object} 为了方便起见, 返回你传入的action对象。
   *
   * 要注意的是, 如果你使用了定制中间件, 它可能会把 `dispatch()` 的
   * 返回值封装成其他内容 (例如, 一个你可以使用await的Promise)。
   */
  function dispatch(action) {
    // action需要为简单对象，如果需要派发异步action,需使用定制中间件
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      );
    }
    // action必须有一个值不为`undefined`的`type`属性
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }
    // 在reducer执行中不能派发action
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }
    // 标记reduer执行阶段，使用reducer计算得到最新的state。
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      // 执行完成重置
      isDispatching = false;
    }
    // 更新监听队列
    const listeners = (currentListeners = nextListeners);
    // 调用注册的监听函数
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
    // 为方便起见，返回派发的action
    return action;
  }

  /**
   * 替换store当前用于计算状态的reducerh函数。
   *
   * 如果你的应用使用了代码分割或者你希望动态加载某些reducer时，
   * 你可能会用到这个方法。如果你需要为redux提供一个热加载机制，
   * 你也可能用到它。
   *
   * @param {Function} 为store提供的新reducer
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    // 提供的reducer需要为函数
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    // 派发一次action，初始化state
    dispatch({ type: ActionTypes.REPLACE });
  }

  /**
   * 为observable/reactive（观察者模式／响应式）库提供交互接口。
   * @returns {observable} 表示状态变更的最简单的observable对象。
   * 获取更多信息, 可以参考observable提案:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    // 这一部分的翻译暂时略过
    const outerSubscribe = subscribe;
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return { unsubscribe };
      },

      [$$observable]() {
        return this;
      }
    }
  }


  // store创建好以后, 会派发一个用于初始化的action，
  // 因此所有reducer需要返回一个初始状态。
  dispatch({ type: ActionTypes.INIT });
  // 返回createStore提供的方法
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  };
}