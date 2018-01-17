import { combineReducers } from 'redux';
import { todoReducer } from './todos';
import { filterReducer } from './filter';

const reducer = combineReducers({
  todos: todoReducer,
  filter: filterReducer
});

export default reducer;