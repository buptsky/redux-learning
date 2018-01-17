import { SET_FILTER } from '../actions/actionTypes';

const initialState = localStorage.getItem('redux_learning_filter') || 'all';

export function filterReducer(state = initialState, action) {
  switch (action.type) {
    case SET_FILTER:
      return action.payload;
    default:
      return state;
  }
}