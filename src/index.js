import React from 'react';
import ReactDOM from 'react-dom';
import reducer from './store/reducers/index';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
// import { Provider } from './mini-redux/react-redux';
import trunk from 'redux-thunk';
import './index.css';
import App from './App';

// redux 状态调试
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducer, composeEnhancers(applyMiddleware(trunk)));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

