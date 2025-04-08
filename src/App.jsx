import React from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import './App.css';
import { TaskList } from './pages/TaskList';

const API_URL = 'http://localhost:8000'; // URL вашего FastAPI сервера

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'ччччччч',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  } else {
    return createAssistant({ getState });
  }
};

export class App extends React.Component {
  constructor(props) {
    super(props);
    console.log('constructor');

    this.state = {
      notes: [], // Изначально пустой массив, данные будут загружены из API
    };

    this.assistant = initializeAssistant(() => this.getStateForAssistant());

    this.assistant.on('data', (event) => {
      console.log(`assistant.on(data)`, event);
      if (event.type === 'character') {
        console.log(`assistant.on(data): character: "${event?.character?.id}"`);
      } else if (event.type === 'insets') {
        console.log(`assistant.on(data): insets`);
      } else {
        const { action } = event;
        this.dispatchAssistantAction(action);
      }
    });

    this.assistant.on('start', (event) => {
      let initialData = this.assistant.getInitialData();
      console.log(`assistant.on(start)`, event, initialData);
    });

    this.assistant.on('command', (event) => {
      console.log(`assistant.on(command)`, event);
    });

    this.assistant.on('error', (event) => {
      console.log(`assistant.on(error)`, event);
    });

    this.assistant.on('tts', (event) => {
      console.log(`assistant.on(tts)`, event);
    });
  }

  componentDidMount() {
    console.log('componentDidMount');
    this.fetchTasks(); // Загружаем задачи из базы при монтировании
  }

  // Метод для получения задач из API
  fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const tasks = await response.json();
      this.setState({ notes: tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  getStateForAssistant() {
    console.log('getStateForAssistant: this.state:', this.state);
    const state = {
      item_selector: {
        items: this.state.notes.map(({ id, title }, index) => ({
          number: index + 1,
          id,
          title,
        })),
        ignored_words: [
          'добавить', 'установить', 'запиши', 'поставь', 'закинь', 'напомнить',
          'удалить', 'удали',
          'выполни', 'выполнил', 'сделал',
        ],
      },
    };
    console.log('getStateForAssistant: state:', state);
    return state;
  }

  dispatchAssistantAction(action) {
    console.log('dispatchAssistantAction', action);
    if (action) {
      switch (action.type) {
        case 'add_note':
          return this.add_note(action);
        case 'done_note':
          return this.done_note(action);
        case 'delete_note':
          return this.delete_note(action);
        default:
          throw new Error();
      }
    }
  }

  // Добавление задачи через API
  add_note = async (action) => {
    console.log('add_note', action);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: action.note, completed: false }),
      });
      const newTask = await response.json();
      this.setState({
        notes: [...this.state.notes, newTask],
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Обновление задачи (выполнено/не выполнено) через API
  done_note = async (action) => {
    console.log('done_note', action);
    const task = this.state.notes.find((note) => note.id === action.id);
    if (!task) return;

    try {
      const response = await fetch(`${API_URL}/tasks/${action.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: task.title, completed: !task.completed }),
      });
      const updatedTask = await response.json();
      this.setState({
        notes: this.state.notes.map((note) =>
          note.id === action.id ? updatedTask : note
        ),
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  _send_action_value(action_id, value) {
    const data = {
      action: {
        action_id: action_id,
        parameters: { value },
      },
    };
    const unsubscribe = this.assistant.sendData(data, (data) => {
      const { type, payload } = data;
      console.log('sendData onData:', type, payload);
      unsubscribe();
    });
  }

  play_done_note(id) {
    const completed = this.state.notes.find((note) => note.id === id)?.completed;
    if (!completed) {
      const texts = ['Молодец!', 'Красавчик!', 'Супер!'];
      const idx = (Math.random() * texts.length) | 0;
      this._send_action_value('done', texts[idx]);
    }
  }

  // Удаление задачи через API
  delete_note = async (action) => {
    console.log('delete_note', action);
    try {
      await fetch(`${API_URL}/tasks/${action.id}`, {
        method: 'DELETE',
      });
      this.setState({
        notes: this.state.notes.filter((note) => note.id !== action.id),
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  render() {
    console.log('render');
    return (
      <>
        <TaskList
          items={this.state.notes}
          onAdd={(note) => {
            this.add_note({ type: 'add_note', note });
          }}
          onDone={(note) => {
            this.play_done_note(note.id);
            this.done_note({ type: 'done_note', id: note.id });
          }}
        />
      </>
    );
  }
}