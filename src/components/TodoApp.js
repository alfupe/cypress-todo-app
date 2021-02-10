import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import Footer from './Footer';
import { destroyTodo, loadTodos, saveTodo, updateTodo } from '../lib/service';
import { filterTodos } from '../lib/utils';

export default class TodoApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTodo: '',
      todos: [],
    };

    this.handleTodoChange = this.handleTodoChange.bind(this);
    this.handleTodoSubmit = this.handleTodoSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
  }

  componentDidMount() {
    loadTodos()
      .then(({ data }) => this.setState({ todos: data }))
      .catch(() => this.setState({ error: true }));
  }

  handleTodoChange(event) {
    this.setState({ currentTodo: event.target.value });
  }

  handleTodoSubmit(event) {
    event.preventDefault();
    const newTodo = {
      name: this.state.currentTodo,
      isComplete: false,
    };
    saveTodo(newTodo)
      .then(({ data }) =>
        this.setState({
          todos: this.state.todos.concat(data),
          currentTodo: '',
        }),
      )
      .catch(() => this.setState({ error: true }));
  }

  handleDelete(id) {
    destroyTodo(id).then(() =>
      this.setState({
        todos: this.state.todos.filter((todo) => todo.id !== id),
      }),
    );
  }

  handleToggle(id) {
    const targetTodo = this.state.todos.find((todo) => todo.id === id);
    const updated = {
      ...targetTodo,
      isComplete: !targetTodo.isComplete,
    };
    updateTodo(updated).then(({ data }) => {
      const targetIndex = this.state.todos.findIndex(
        (todo) => todo.id === data.id,
      );
      const todos = this.state.todos.map((todo) =>
        todo.id === data.id ? data : todo,
      );
      this.setState({ todos });
    });
  }

  render() {
    const remaining = this.state.todos.filter((todo) => !todo.isComplete)
      .length;

    return (
      <Router>
        <div>
          <header className="header">
            <h1>todos</h1>
            {this.state.error && <span className="error">Oh no!</span>}
            <TodoForm
              currentTodo={this.state.currentTodo}
              handleTodoSubmit={this.handleTodoSubmit}
              handleNewTodoChange={this.handleTodoChange}
            />
          </header>
          <section className="main">
            <Route
              path="/:filter?"
              render={({ match }) => (
                <TodoList
                  todos={filterTodos(match.params.filter, this.state.todos)}
                  handleDelete={this.handleDelete}
                  handleToggle={this.handleToggle}
                />
              )}
            />
          </section>
          <Footer remaining={remaining} />
        </div>
      </Router>
    );
  }
}
