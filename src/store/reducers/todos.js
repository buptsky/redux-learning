import { ADD_TODO, REMOVE_TODO, TOGGLE_TODO, ADD_TODO_LOADING } from '../actions/actionTypes';

const initialState = {
  todoList: JSON.parse(localStorage.getItem('redux_learning_todoList')) || [],
  isLoading: false
};

export function todoReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todoList: [action.payload, ...state.todoList],
        isLoading: false
      };
    case ADD_TODO_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case TOGGLE_TODO:
      return {
        ...state,
        todoList: state.todoList.map((item) => {
          if (item.id === action.payload.id) {
            return { ...item, completed: !item.completed }
          } else {
            return item;
          }
        })
      };
    case REMOVE_TODO:
      return {
        ...state,
        todoList: state.todoList.filter((item) => {
          return item.id !== action.payload.id;
        })
      }
    default:
      return state;
  }
}