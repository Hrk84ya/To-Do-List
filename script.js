const form = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const taskList = document.getElementById("task-list");
const taskStats = document.getElementById("task-stats");
const emptyState = document.getElementById("empty-state");
const submitBtn = document.getElementById("submit-btn");

let tasks = [];
let editTaskId = null;

const priorityOrder = { high: 3, medium: 2, low: 1 };

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (taskText !== "" && priority !== "") {
    if (editTaskId) {
      updateTask(editTaskId, taskText, priority);
    } else {
      addTask(taskText, priority);
    }
    taskInput.value = "";
    prioritySelect.value = "";
    editTaskId = null;
    submitBtn.querySelector(".btn-text").textContent = "Add Task";
    submitBtn.querySelector(".btn-icon").innerHTML =
      '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
  }
});

function addTask(text, priority) {
  const task = {
    id: Date.now().toString(),
    text,
    priority,
    completed: false,
  };
  tasks.push(task);
  sortTasks();
  saveTasks();
  renderTasks();
}

function updateTask(id, newText, newPriority) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.text = newText;
    task.priority = newPriority;
    sortTasks();
    saveTasks();
    renderTasks();
  }
}

function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  if (total === 0) {
    taskStats.innerHTML = "";
    return;
  }

  taskStats.innerHTML = `
    <span class="stat-item">
      <span class="stat-dot" style="background: var(--accent)"></span>
      ${total} task${total !== 1 ? "s" : ""}
    </span>
    <span class="stat-item">
      <span class="stat-dot" style="background: var(--success)"></span>
      ${completed} done
    </span>
    <span class="stat-item">
      <span class="stat-dot" style="background: var(--text-muted)"></span>
      ${pending} pending
    </span>
  `;
}

function renderTasks() {
  taskList.innerHTML = "";
  renderStats();

  emptyState.classList.toggle("hidden", tasks.length > 0);

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.setAttribute("data-priority", task.priority);
    li.setAttribute("data-id", task.id);
    if (task.completed) li.classList.add("completed");

    const priorityLabel = document.createElement("span");
    priorityLabel.className = "priority-label";
    priorityLabel.textContent = task.priority;

    const taskSpan = document.createElement("span");
    taskSpan.className = "task-text";
    taskSpan.textContent = task.text;

    // Icon buttons
    const completeBtn = document.createElement("button");
    completeBtn.classList.add("complete-btn");
    completeBtn.title = task.completed ? "Undo" : "Complete";
    completeBtn.innerHTML = task.completed
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    completeBtn.addEventListener("click", function () {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const editBtn = document.createElement("button");
    editBtn.classList.add("edit-btn");
    editBtn.title = "Edit";
    editBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    editBtn.addEventListener("click", function () {
      taskInput.value = task.text;
      prioritySelect.value = task.priority;
      editTaskId = task.id;
      submitBtn.querySelector(".btn-text").textContent = "Update";
      submitBtn.querySelector(".btn-icon").innerHTML =
        '<polyline points="20 6 9 17 4 12"/>';
      taskInput.focus();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.title = "Delete";
    deleteBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
    deleteBtn.addEventListener("click", function () {
      li.style.animation = "slideOut 0.25s ease-in forwards";
      li.addEventListener("animationend", () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();
        renderTasks();
      });
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "task-buttons";
    buttonContainer.append(completeBtn, editBtn, deleteBtn);

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";
    taskInfo.append(priorityLabel, taskSpan);

    const taskContainer = document.createElement("div");
    taskContainer.className = "task-container";
    taskContainer.append(taskInfo, buttonContainer);

    li.appendChild(taskContainer);
    taskList.appendChild(li);
  });
}

function sortTasks() {
  tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const saved = localStorage.getItem("tasks");
  tasks = saved ? JSON.parse(saved) : [];
  sortTasks();
  renderTasks();
}

document.addEventListener("DOMContentLoaded", loadTasks);
