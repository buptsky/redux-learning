import React from 'react';
// import { connect } from 'react-redux';
import { connect } from './mini-redux/react-redux';
import { removeTodo, toggleTodo } from './store/actions/actions';

@connect(
  (state) => ({
    todoList: state.todos.todoList,
    loading: state.todos.isLoading,
    filter: state.filter
  }),
  { removeTodo, toggleTodo }
)
class Todo extends React.Component {

  render() {
    console.log(this.props);
    const { todoList, filter, loading } = this.props;
    const filterTodos = todoList.filter((item) => {
      switch (filter) {
        case 'all':
          return true;
        case 'completed':
          return item.completed;
        case 'uncompleted':
          return !item.completed;
        default:
          return true;
      }
    });
    return (
      <div style={{ marginTop: 20, minHeight: 150 }}>
        {
          (!loading && !filterTodos.length) && (
            <div>
              <div style={{ textAlign: 'center' }}>
                <i className="icon-shocked" style={{ lineHeight: '150px', color: '#666' }} />
                <span className="tip">这里什么都没有</span>
              </div>
            </div>
          )
        }
        {
          loading && (
            <div>
              <div style={{ textAlign: 'center' }}>
                <i className="icon-spinner9 loading" style={{ lineHeight: '150px' }} />
              </div>
            </div>
          )
        }
        {
          !loading && filterTodos.map((item) => {
            return (
              <div className="todo-list" key={item.id}>
                <i
                  className={item.completed ?
                    'icon-checkbox-checked' :
                    'icon-checkbox-unchecked'}
                  onClick={() => this.props.toggleTodo(item.id)}
                />
                <span className="item-name">{item.text}</span>
                <i
                  className="icon-bin"
                  onClick={() => this.props.removeTodo(item.id)}
                />
              </div>
            );
          })
        }
      </div>
    );
  }
}

export default Todo;
