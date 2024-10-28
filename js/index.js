import store from "./store.js";

const API_URL = "http://localhost:3000/todos";

const d = document,
  $todoList = d.getElementById("todo-list"),
  $createTodoBtn = d.getElementById("create-todo"),
  $todoId = d.getElementById("todo-id"),
  $todoCompleted = d.getElementById("todo-completed"),
  $todoTitle = d.getElementById("todo-title"),
  $todoDescription = d.getElementById("todo-description");

// Function to fetch tasks from the API
function fetchTodos() {
  store.dispatch({ type: "FETCH_TODOS_REQUEST" });

  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      store.dispatch({ type: "FETCH_TODOS_SUCCESS", payload: data });
    })
    .catch((error) => {
      store.dispatch({ type: "FETCH_TODOS_FAILURE", error: error.message });
    });
}

// Function to render tasks in the DOM
function renderTodos() {
  const state = store.getState();
  $todoList.innerHTML = "";

  if (state.todos.length === 0) {
    const $noTaskMessage = d.createElement("li");

    $noTaskMessage.className = "no-tasks";
    $noTaskMessage.textContent = "No tasks available";
    $todoList.appendChild($noTaskMessage);

    return;
  }

  const pendingTodos = state.todos.filter((todo) => !todo.completed),
    completedTodos = state.todos.filter((todo) => todo.completed);

  [...pendingTodos, ...completedTodos].forEach((todo) => {
    const $li = d.createElement("li");

    $li.className = todo.completed ? "completed" : "";
    $li.dataset.id = todo.id;
    $li.dataset.title = todo.title;
    $li.dataset.description = todo.description;
    $li.dataset.completed = todo.completed;
    $todoList.appendChild($li);

    const $spanTitle = d.createElement("span");

    $spanTitle.textContent = `${todo.title}`;
    $li.appendChild($spanTitle);

    /*const $spanDesc = d.createElement("span");

    $spanDesc.textContent = `${todo.description}`;
    $li.appendChild($spanDesc);*/

    const $toggleBtn = d.createElement("button");

    $toggleBtn.className = "btn-toggle";
    $toggleBtn.textContent = todo.completed ? "Check" : "Uncheck";
    $li.appendChild($toggleBtn);

    const $updateBtn = d.createElement("button");

    $updateBtn.className = "btn-update";
    $updateBtn.textContent = "Update";
    $li.appendChild($updateBtn);

    const $deleteBtn = d.createElement("button");

    $deleteBtn.className = "btn-delete";
    $deleteBtn.textContent = "Delete";
    $li.appendChild($deleteBtn);
  });
}

// Function to create and update a task
function createOrUpdateTodo() {
  let id = $todoId.value,
    completed = $todoCompleted.value,
    title = $todoTitle.value.trim(),
    description = $todoDescription.value.trim();

  if (!title) {
    alert("Title needs to be added!");
    return;
  }

  if (!description) {
    alert("The description needs to be added!");
    return;
  }

  if (id) {
    // Update todo
    const updateTodo = {
      id,
      title,
      description,
      completed: completed === "true" ? true : false,
    };
    fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateTodo),
    })
      .then((res) => res.json())
      .then((data) => {
        store.dispatch({ type: "UPDATE_TODO", payload: data });
      });
  } else {
    // Create todo
    const createTodo = {
      id: crypto.randomUUID(),
      title,
      description,
      completed: false,
    };

    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createTodo),
    })
      .then((res) => res.json())
      .then((data) => {
        store.dispatch({ type: "CREATE_TODO", payload: data });
      });
  }

  clearForm();
}

// Function to fill the form (update a task)
function updateTodo(todo) {
  $todoId.value = todo.dataset.id;
  $todoTitle.value = todo.dataset.title;
  $todoDescription.value = todo.dataset.description;
  $todoCompleted.value = todo.dataset.completed;
}

// Function to delete a task
function deleteTodo(id) {
  let confirmDelete = confirm(
    `Are you sure you want to delete the task with id ${id}?`
  );

  if (confirmDelete)
    fetch(`${API_URL}/${id}`, { method: "DELETE" }).then(() =>
      store.dispatch({ type: "DELETE_TODO", payload: data })
    );
}

// Function to mark or unmark a task as completed
function toggleTodoCompleted(todo) {
  const toggleTodo = {
    ...todo,
    completed: !todo.completed,
  };
  fetch(`${API_URL}/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toggleTodo),
  })
    .then((res) => res.json())
    .then((data) => {
      store.dispatch({ type: "TOGGLE_TODO", payload: data });
    });
}

// Function to clear the form
function clearForm() {
  $todoId.value = "";
  $todoCompleted.value = "";
  $todoTitle.value = "";
  $todoDescription.value = "";
}

store.subscribe(renderTodos);

d.addEventListener("DOMContentLoaded", fetchTodos);

$createTodoBtn.addEventListener("click", createOrUpdateTodo);

$todoList.addEventListener("click", (e) => {
  const $parent = e.target.parentElement;

  if (e.target.matches(".btn-update") && !$parent.matches(".completed")) {
    updateTodo($parent);
  }

  if (e.target.matches(".btn-toggle")) {
    let todo = {
      id: $parent.dataset.id,
      title: $parent.dataset.title,
      description: $parent.dataset.description,
      completed: $parent.dataset.completed === "true" ? true : false,
    };

    toggleTodoCompleted(todo);
  }

  if (e.target.matches(".btn-delete")) {
    deleteTodo($parent.dataset.id);
  }
});
