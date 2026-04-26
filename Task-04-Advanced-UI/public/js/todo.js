/**
 * DataVault Task 04 — Dynamic Todo App
 * Full CRUD with localStorage persistence and filter views
 */
(function () {
  'use strict';

  const todoInput  = document.getElementById('todoInput');
  const addBtn     = document.getElementById('addTodoBtn');
  const todoList   = document.getElementById('todoList');
  const todoEmpty  = document.getElementById('todoEmpty');
  const todoStats  = document.getElementById('todoStats');
  const todoActions= document.getElementById('todoActions');
  const markAllBtn = document.getElementById('markAllBtn');
  const clearDone  = document.getElementById('clearDoneBtn');

  if (!todoInput) return;

  const STORAGE_KEY = 'dv_todos_v1';
  let todos  = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  let filter = 'all';

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function getFiltered() {
    if (filter === 'active') return todos.filter(t => !t.done);
    if (filter === 'done')   return todos.filter(t => t.done);
    return todos;
  }

  function render() {
    const list = getFiltered();
    todoList.innerHTML = '';

    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'dv-todo-empty';
      empty.innerHTML = `<i class="bi bi-clipboard-check"></i><p>${
        filter === 'done' ? 'No completed tasks yet.' :
        filter === 'active' ? 'All tasks done! 🎉' :
        'No tasks yet — add one above!'
      }</p>`;
      todoList.appendChild(empty);
    } else {
      list.forEach(todo => {
        const item = document.createElement('div');
        item.className = 'dv-todo-item' + (todo.done ? ' done' : '');
        item.dataset.id = todo.id;
        item.innerHTML = `
          <div class="dv-todo-checkbox" onclick="toggleTodo('${todo.id}')">
            ${todo.done ? '<i class="bi bi-check-lg"></i>' : ''}
          </div>
          <span class="dv-todo-text">${escHtml(todo.text)}</span>
          <span class="dv-todo-priority pri-${todo.priority}">${
            todo.priority === 'high' ? '🔴 High' :
            todo.priority === 'low'  ? '🟢 Low'  : 'Normal'
          }</span>
          <button class="dv-todo-del" onclick="deleteTodo('${todo.id}')" title="Delete">
            <i class="bi bi-trash3"></i>
          </button>`;
        todoList.appendChild(item);
      });
    }

    // Stats
    const total  = todos.length;
    const done   = todos.filter(t => t.done).length;
    const active = total - done;
    todoStats.textContent = `${total} task${total !== 1 ? 's' : ''} · ${active} active · ${done} done`;

    // Bulk actions
    todoActions.style.display = total > 0 ? 'flex' : 'none';
    save();
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    const priority = document.getElementById('todoPriority').value;
    todos.unshift({ id: Date.now().toString(), text, done: false, priority });
    todoInput.value = '';
    todoInput.focus();
    render();
  }

  window.toggleTodo = function (id) {
    const todo = todos.find(t => t.id === id);
    if (todo) { todo.done = !todo.done; render(); }
  };

  window.deleteTodo = function (id) {
    const item = document.querySelector(`[data-id="${id}"]`);
    if (item) {
      item.style.transition = 'opacity .15s ease, transform .15s ease';
      item.style.opacity = '0';
      item.style.transform = 'translateX(8px)';
      setTimeout(() => {
        todos = todos.filter(t => t.id !== id);
        render();
      }, 150);
    }
  };

  // Filters
  document.getElementById('todoFilters').querySelectorAll('.dv-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dv-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });
  });

  // Mark all done
  markAllBtn.addEventListener('click', () => {
    todos.forEach(t => t.done = true);
    render();
  });

  // Clear completed
  clearDone.addEventListener('click', () => {
    todos = todos.filter(t => !t.done);
    render();
  });

  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTodo(); });

  // Seed demo data if empty
  if (todos.length === 0) {
    todos = [
      { id: '1', text: 'Build Task 04 Advanced UI', done: true,  priority: 'high' },
      { id: '2', text: 'Implement hash-based routing', done: true, priority: 'high' },
      { id: '3', text: 'Add password strength meter',  done: false, priority: 'normal' },
      { id: '4', text: 'Deploy to GitHub', done: false, priority: 'low' },
    ];
    save();
  }

  render();
})();
