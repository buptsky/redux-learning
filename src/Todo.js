import React from 'react';
import { connect } from 'react-redux';
import { removeTodo, toggleTodo } from './store/actions/actions';

@connect(
  (state) => ({
    todos: state.todos,
    filter: state.filter
  }),
  { removeTodo, toggleTodo }
)
class Todo extends React.Component {

  render() {
    const { todos, filter } = this.props;
    const filterTodos = todos.filter((item) => {
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
          !filterTodos.length && (
            <div>
              <div style={{textAlign: 'center'}}>
                <i className="icon-shocked" style={{lineHeight: '150px', color: '#666'}}/>
                <span className="tip">这里什么都没有</span>
              </div>
            </div>
          )
        }
        {
          filterTodos.map((item) => {
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
