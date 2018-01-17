import { ADD_TODO, ADD_TODO_LOADING, REMOVE_TODO, TOGGLE_TODO, SET_FILTER } from './actionTypes';

export const addTodo = (text) => ({
  type: ADD_TODO,
  payload: {
    completed: false,
    id: Date.now(),
    text: text
  }
});

export const addTodoAsync = (text) => (dispatch, getState) => {
  dispatch({
    type: ADD_TODO_LOADING
  });
  return setTimeout(() => {
    dispatch({
      type: ADD_TODO,
      payload: {
        completed: false,
        id: Date.now(),
        text: text
      }
    });
  }, 1000);
}

export const toggleTodo = (id) => ({
  type: TOGGLE_TODO,
  payload: {
    id: id,
  }
});

export const removeTodo = (id) => ({
  type: REMOVE_TODO,
  payload: {
    id: id,
  }
});

export const setFilter = (filter) => ({
  type: SET_FILTER,
  payload: filter
})