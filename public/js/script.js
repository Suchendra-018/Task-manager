const API_BASE = "/api";
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");
if (!user || !token) {
    window.location.href = "index.html";
}

document.getElementById("user").innerText = user;

let tasks = [];
let currentFilter = "all";

async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Failed to load tasks");
        tasks = await response.json();
    } catch (error) {
        console.error(error);
        tasks = [];
    }
}

function updateSummary() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    document.getElementById("taskCount").innerText = `${total} task${total === 1 ? "" : "s"}`;
    document.getElementById("completedCount").innerText = `${completed} completed`;
}

function getFilteredTasks() {
    if (currentFilter === "active") {
        return tasks.filter(task => !task.completed);
    }
    if (currentFilter === "completed") {
        return tasks.filter(task => task.completed);
    }
    return tasks;
}

function updateFilterButtons() {
    document.querySelectorAll(".filters button").forEach(button => {
        button.classList.toggle("active", button.id === `filter${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`);
    });
}

function setFilter(filter) {
    currentFilter = filter;
    updateFilterButtons();
    displayTasks();
}

function displayTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    const visibleTasks = getFilteredTasks();

    visibleTasks.forEach(taskObj => {
        const li = document.createElement("li");

        const textSpan = document.createElement("span");
        textSpan.innerText = taskObj.text;
        if (taskObj.completed) {
            textSpan.classList.add("completed");
        }

        const btnDiv = document.createElement("div");
        btnDiv.className = "task-btns";

        const doneBtn = document.createElement("button");
        doneBtn.innerText = taskObj.completed ? "↺" : "✔";
        doneBtn.title = taskObj.completed ? "Mark as active" : "Mark as done";
        doneBtn.onclick = () => toggleTask(taskObj._id);

        const editBtn = document.createElement("button");
        editBtn.innerText = "✏️";
        editBtn.title = "Edit task";
        editBtn.onclick = () => editTask(taskObj._id);

        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "❌";
        deleteBtn.title = "Delete task";
        deleteBtn.onclick = () => deleteTask(taskObj._id);

        btnDiv.appendChild(doneBtn);
        btnDiv.appendChild(editBtn);
        btnDiv.appendChild(deleteBtn);

        li.appendChild(textSpan);
        li.appendChild(btnDiv);
        list.appendChild(li);
    });

    updateSummary();
}

async function refreshTasks() {
    await fetchTasks();
    displayTasks();
}

async function addTask() {
    const taskInput = document.getElementById("task");
    const taskText = taskInput.value.trim();
    if (taskText === "") return;

    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: taskText })
        });

        if (!response.ok) throw new Error("Failed to create task");
        taskInput.value = "";
        await refreshTasks();
    } catch (error) {
        console.error(error);
        alert("Unable to save task. Make sure the server is running.");
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Delete failed");
        await refreshTasks();
    } catch (error) {
        console.error(error);
        alert("Unable to delete task.");
    }
}

async function toggleTask(taskId) {
    const task = tasks.find(item => item._id === taskId);
    if (!task) return;

    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ completed: !task.completed })
        });

        if (!response.ok) throw new Error("Update failed");
        await refreshTasks();
    } catch (error) {
        console.error(error);
        alert("Unable to update task status.");
    }
}

async function editTask(taskId) {
    const task = tasks.find(item => item._id === taskId);
    if (!task) return;

    const newText = prompt("Edit task", task.text);
    if (newText === null) return;
    const trimmed = newText.trim();
    if (trimmed === "") return;

    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: trimmed })
        });

        if (!response.ok) throw new Error("Update failed");
        await refreshTasks();
    } catch (error) {
        console.error(error);
        alert("Unable to edit task.");
    }
}

async function clearCompleted() {
    try {
        const response = await fetch(`${API_BASE}/tasks/clear-completed`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Clear failed");
        await refreshTasks();
    } catch (error) {
        console.error(error);
        alert("Unable to clear completed tasks.");
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

async function initializeApp() {
    await refreshTasks();
    updateFilterButtons();
}

initializeApp();