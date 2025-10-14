class Todo {
  selectors = {
    root: '[data-js-todo]',
    newTaskForm: '[data-js-todo-new-task-form]',
    newTaskInput: '[data-js-todo-new-task-input]',
    searchTaskForm: '[data-js-todo-search-task-form]',
    searchTaskInput: '[data-js-todo-search-task-input]',
    totalTasks: '[data-js-todo-total-tasks]',
    deleteAllButton: '[data-js-todo-delete-all-button]',
    list: '[data-js-todo-list]',
    item: '[data-js-todo-item]',
    itemCheckbox: '[data-js-todo-item-checkbox]',
    itemLabel: '[data-js-todo-item-label]',
    itemDeleteButton: '[data-js-todo-item-delete-button]',
    emptyMessage: '[data-js-todo-empty-message]'
  };

  stateClasses = {
    isVisible: 'is-visible',
    isDisappearing: 'is-disappearing'
  };

  localStorageKey = 'todo-items';

  constructor() {
    this.rootElem = document.querySelector(this.selectors.root);

    this.newTaskFormElem = this.rootElem.querySelector(this.selectors.newTaskForm);
    this.newTaskInputElem = this.rootElem.querySelector(this.selectors.newTaskInput);

    this.searchTaskFormElem = this.rootElem.querySelector(this.selectors.searchTaskForm);
    this.searchTaskInputElem = this.rootElem.querySelector(this.selectors.searchTaskInput);

    this.totalTasksElem = this.rootElem.querySelector(this.selectors.totalTasks);
    this.deleteAllButtonElem = this.rootElem.querySelector(this.selectors.deleteAllButton);

    this.listElem = this.rootElem.querySelector(this.selectors.list);
    this.emptyMessageElem = this.rootElem.querySelector(this.selectors.emptyMessage);

    this.state = {
      items: this.getItemsFromLS(),
      filteredItems: null,
      searchQuery: ''
    };

    this.render();
    this.bindEvents();
  }

  getItemsFromLS() {
    const rawData = localStorage.getItem(this.localStorageKey);

    if (!rawData) return [];

    try {
      const parsedData = JSON.parse(rawData);

      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      console.log('Todo items parse error');

      return [];
    }
  }

  saveItemsToLS() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.state.items));
  }

  render() {
    this.totalTasksElem.textContent = this.state.items.length;

    this.deleteAllButtonElem.classList.toggle(
      this.stateClasses.isVisible,
      this.state.items.length > 0 && !this.state.filteredItems
    );

    const items = this.state.filteredItems ?? this.state.items;

    this.listElem.innerHTML = items
      .map(
        ({ id, description, isChecked }) => `
      <li class="todo__item todo-item" data-js-todo-item>
        <input
          class="todo-item__checkbox"
          id="${id}"
          ${isChecked ? 'checked' : ''}
          type="checkbox"
          data-js-todo-item-checkbox
        />
        <label class="todo-item__label" for="${id}"  data-js-todo-item-label>${description}</label>
        <button
          class="todo-item__delete-button"
          type="button"
          title="Delete"
          aria-label="Delete"
          data-js-todo-item-delete-button
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="#757575"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </li>
    `
      )
      .join('');

    const isEmptyItems = this.state.items.length === 0;
    const isEmptyFilteredItems = this.state.filteredItems?.length === 0;

    this.emptyMessageElem.textContent = isEmptyFilteredItems
      ? 'No tasks found'
      : isEmptyItems
      ? 'There are no tasks yet'
      : '';
  }

  addItem(description) {
    this.state.items.push({
      id: crypto?.randomUUID() ?? Date.now().toString(),
      description,
      isChecked: false
    });

    this.saveItemsToLS();
    this.render();
  }

  deleteItem(id) {
    this.state.items = this.state.items.filter(item => item.id !== id);

    this.saveItemsToLS();
    this.render();
  }

  toggleCheckedState(id) {
    this.state.items = this.state.items.map(item => {
      if (item.id === id) return { ...item, isChecked: !item.isChecked };

      return item;
    });

    this.saveItemsToLS();
    this.render();
  }

  filter() {
    const formattedQuery = this.state.searchQuery.toLowerCase();

    this.state.filteredItems = this.state.items.filter(({ description }) => {
      const formattedDescription = description.toLowerCase();

      return formattedDescription.includes(formattedQuery);
    });

    this.render();
  }

  resetFilter() {
    this.state.filteredItems = null;
    this.state.searchQuery = '';

    this.render();
  }

  onNewTaskFormSubmit = event => {
    event.preventDefault();

    const newTodoItemDescription = this.newTaskInputElem.value;

    if (newTodoItemDescription.trim().length > 0) {
      this.addItem(newTodoItemDescription);
      this.resetFilter();

      this.newTaskInputElem.value = '';
      this.newTaskInputElem.focus();
    }
  };

  onSearchTaskFormSubmit = event => {
    event.preventDefault();
  };

  onSearchTaskInputChange = ({ target }) => {
    const value = target.value.trim();

    if (value.length > 0) {
      this.state.searchQuery = value;
      this.filter();
    } else {
      this.resetFilter();
    }
  };

  onDeleteAllButtonClick = () => {
    const isConfirmed = confirm('Are you sure you want to delete all the tasks?');

    if (!isConfirmed) return;

    this.state.items = [];
    this.saveItemsToLS();
    this.render();
  };

  onClick = ({ target }) => {
    if (target.matches(this.selectors.itemDeleteButton)) {
      const itemElem = target.closest(this.selectors.item);
      const itemCheckboxElem = itemElem.querySelector(this.selectors.itemCheckbox);

      itemElem.classList.add(this.stateClasses.isDisappearing);

      setTimeout(() => this.deleteItem(itemCheckboxElem.id), 400);
    }
  };

  onChange = ({ target }) => {
    if (target.matches(this.selectors.itemCheckbox)) {
      this.toggleCheckedState(target.id);
    }
  };

  bindEvents() {
    this.newTaskFormElem.addEventListener('submit', this.onNewTaskFormSubmit);
    this.searchTaskFormElem.addEventListener('submit', this.onSearchTaskFormSubmit);
    this.searchTaskInputElem.addEventListener('input', this.onSearchTaskInputChange);
    this.deleteAllButtonElem.addEventListener('click', this.onDeleteAllButtonClick);
    this.listElem.addEventListener('click', this.onClick);
    this.listElem.addEventListener('change', this.onChange);
  }
}

new Todo();
