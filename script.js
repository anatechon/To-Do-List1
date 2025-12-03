document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.getElementById("new-task");
  const addButton = document.getElementById("add-button");
  const taskList = document.getElementById("task-list");
  const totalTasks = document.getElementById("total-tasks");
  const completedTasks = document.getElementById("completed-tasks");
  const filterButtons = document.querySelectorAll(".filter-button");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  function updateTaskCount() {
    totalTasks.textContent = tasks.length;
    completedTasks.textContent = tasks.filter((task) => task.completed).length;
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    updateTaskCount();
  }

  function renderTasks(filter = "all") {
    taskList.innerHTML = "";
    let filteredTasks = [...tasks];

    switch (filter) {
      case "completed":
        filteredTasks = tasks.filter((task) => task.completed);
        break;
      case "pending":
        filteredTasks = tasks.filter((task) => !task.completed);
        break;
    }

    filteredTasks.forEach((task, index) => {
      const li = document.createElement("li");
      li.draggable = true;
      li.classList.add("task-item");
      li.innerHTML = `
                <input type="checkbox" data-index="${index}" ${
        task.completed ? "checked" : ""
      }>
                <span class="${task.completed ? "completed" : ""}">${
        task.text
      }</span>
                <button data-index="${index}" class="delete-button">Excluir</button>
            `;
      taskList.appendChild(li);

      li.addEventListener("dragstart", dragStart);
      li.addEventListener("dragover", dragOver);
      li.addEventListener("drop", drop);
    });

    updateTaskCount();
  }

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
      tasks.push({
        text: taskText,
        completed: false,
      });
      taskInput.value = "";
      saveTasks();
      renderTasks(
        document.querySelector(".filter-button.active").dataset.filter
      );
    }
  }

  addButton.addEventListener("click", addTask);

  taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addTask();
    }
  });

  taskList.addEventListener("change", function (event) {
    if (event.target.tagName === "INPUT" && event.target.type === "checkbox") {
      const index = parseInt(event.target.dataset.index);
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks(
        document.querySelector(".filter-button.active").dataset.filter
      );
    }
  });

  taskList.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-button")) {
      const index = parseInt(event.target.dataset.index);
      tasks.splice(index, 1);
      saveTasks();
      renderTasks(
        document.querySelector(".filter-button.active").dataset.filter
      );
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      renderTasks(this.dataset.filter);
    });
  });

  let draggedItem = null;

  function dragStart(event) {
    draggedItem = event.target;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/html", draggedItem.innerHTML);
    draggedItem.classList.add("dragging");
  }

  function dragOver(event) {
    event.preventDefault();
  }

  function drop(event) {
    event.preventDefault();
    if (event.target.tagName === "LI" && draggedItem !== event.target) {
      let taskItems = Array.from(taskList.querySelectorAll("li"));
      let dragIndex = taskItems.indexOf(draggedItem);
      let dropIndex = taskItems.indexOf(event.target);

      let temp = tasks[dragIndex];
      tasks.splice(dragIndex, 1);
      tasks.splice(dropIndex, 0, temp);

      saveTasks();
      renderTasks(
        document.querySelector(".filter-button.active").dataset.filter
      );
    }
    draggedItem.classList.remove("dragging");
    draggedItem = null;
  }

  renderTasks();
});
