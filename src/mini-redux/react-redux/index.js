import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from '../redux';

export const connect = (mapStateToProps = state => state, mapDispatchToProps = {}) => {
  return function (WrapComponent) {
    return class ConnectComponent extends React.Component {
      static contextTypes = {
        store: PropTypes.object
      }

      constructor(props, context) {
        super(props, context);
        this.state = {
          props: {}
        };
      }

      componentWillMount() {
        const { store } = this.context;
        store.subscribe(() => this.update());
        this.update();
      }

      update = () => {
        const { store } = this.context;
        const stateProps = mapStateToProps(store.getState());
        const dispatchProps = bindActionCreators(mapDispatchToProps, store.dispatch);
        console.log(stateProps);
        this.setState({
          props: {
            ...this.state.props,
            ...stateProps,
            ...dispatchProps,
          }
        });
      }

      render() {
        console.log(this.state.props);
        return <WrapComponent {...this.state.props} />
      }

    }
  }
}


export class Provider extends React.Component {
  static childContextTypes = {
    store: PropTypes.object
  }

  constructor(props, context) {
    super(props, context);
    this.store = props.store;
  }

  getChildContext() {
    return { store: this.store };
  }

  render() {
    return this.props.children;
  }
}
