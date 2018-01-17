import {ADD_TODO, REMOVE_TODO, TOGGLE_TODO} from '../actions/actionTypes';

const initialState = JSON.parse(localStorage.getItem('redux_learning_todos')) || [];;

export function todoReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return [action.payload, ...state];
    case TOGGLE_TODO:
      return state.map((item) => {
        if (item.id === action.payload.id) {
          return {...item, completed: !item.completed}
        } else {
          return item;
        }
      });
    case REMOVE_TODO:
      return state.filter((item) => {
        return item.id !== action.payload.id;
      });
    default:
      return state;
  }
}