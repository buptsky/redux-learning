import React from 'react';
import { connect } from 'react-redux';
// import { connect } from './mini-redux/react-redux';
import reduxLogo from './asset/redux.png';
import Todo from './Todo';
import { addTodo, addTodoAsync, removeTodo, toggleTodo, setFilter } from './store/actions/actions';

@connect(
  (state) => ({
    todoList: state.todos.todoList,
    filter: state.filter
  }),
  { addTodo, addTodoAsync, removeTodo, toggleTodo, setFilter }
)
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    this.saveToLocal(nextProps.todoList, nextProps.filter);
  }

  saveToLocal = (todoList, filter) => {
    localStorage.setItem('redux_learning_todoList', JSON.stringify(todoList));
    localStorage.setItem('redux_learning_filter', filter);
  }

  onSubmit = (type) => {
    if (!this.state.inputValue.trim()) return;
    if (type === 'async') {
      this.props.addTodoAsync(this.state.inputValue);
    } else {
      this.props.addTodo(this.state.inputValue);
    }
    this.setState({
      inputValue: ''
    });
  }

  changeInput = (e) => {
    this.setState({
      inputValue: e.target.value
    })
  }

  goGithub = () => {
    const url = 'https://github.com/buptsky/redux-learning';
    window.open(url);
  }

  render() {
    const { filter } = this.props;
    const operate = [
      {
        value: 'all',
        label: '全部'
      },
      {
        value: 'uncompleted',
        label: '未完成'
      },
      {
        value: 'completed',
        label: '已完成'
      },
    ]
    return (
      <div>
        <div className="logo" style={{ textAlign: 'center', paddingTop: '20px' }}>
          <img src={reduxLogo} alt="Logo" style={{ width: '30%' }} />
        </div>
        <div className="content" style={{ width: '80%', margin: '20px auto' }}>
          <div className="input" style={{ margin: '0 auto', width: 278 }}>
            <input type="text"
                   placeholder="输入待办事项"
                   style={{ marginRight: 20 }}
                   value={this.state.inputValue}
                   onChange={this.changeInput}
            />
            <i
              className="icon-plus"
              onClick={() => this.onSubmit()}
              style={{ marginRight: 10 }}
              title="同步添加"
            />
            <i
              className="icon-hour-glass"
              onClick={() => this.onSubmit('async')}
              title="异步添加"
            />
          </div>
          <Todo />
          <div className="filter">
            <i className="icon-clipboard" />
            <span className="item-name">todolist 筛选</span>
            <div className="operate">
              {
                operate.map((item) => {
                  return (
                    <button
                      key={item.value}
                      onClick={() => this.props.setFilter(item.value)}
                      style={{
                        backgroundColor: filter === item.value ? '#fff' : '#73d13d',
                        color: filter === item.value ? '#73d13d' : '#fff'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })
              }
            </div>
          </div>
        </div>
        <div className="github">
          <i className="icon-github" onClick={this.goGithub} title="访问项目地址" />
        </div>
      </div>
    );
  }
}

export default App;
