const API_BASE = "/api";
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");
if (!user || !token) {
    window.location.href = "index.html";
}

document.getElementById("user").innerText = user;

let tasks = [];
let editTaskId = null;
let searchText = "";
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
function showSuccess(message) {
    Toastify({
        text: message,
        duration: 2500,
        gravity: "top",
        position: "right",
        close: true,
        style: {
            background: "linear-gradient(135deg,#8b5cf6,#6366f1)"
        }
    }).showToast();
}

function showError(message) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        close: true,
        style: {
            background: "#ef4444"
        }
    }).showToast();
}

function updateSummary() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const active = total - completed;

    document.getElementById("totalTasks").innerText = total;

    document.getElementById("activeTasks").innerText = active;

    document.getElementById("completedTasks").innerText = completed;

   
    // Progress Bar

    const percent =
        total === 0
            ? 0
            : Math.round((completed / total) * 100);

    document.getElementById("progressPercent").innerText =
        `${percent}%`;

    document.getElementById("progressFill").style.width =
        `${percent}%`;

    document.getElementById("progressText").innerText =
        `${completed} of ${total} tasks completed`;

    
    // Bonus Celebration
  

    if (total > 0 && completed === total) {

        if (!window.allTasksCelebrated) {

            showSuccess("Congratulations! All tasks completed.");

            window.allTasksCelebrated = true;

        }

    } else {

        window.allTasksCelebrated = false;

    }

}
function searchTasks(){

    searchText = document
        .getElementById("searchTask")
        .value
        .toLowerCase();

    displayTasks();

}
function getFilteredTasks(){

    let filtered = tasks;

    if(currentFilter==="active"){

        filtered = filtered.filter(task=>!task.completed);

    }

    else if(currentFilter==="completed"){

        filtered = filtered.filter(task=>task.completed);

    }

    if(searchText){

        filtered = filtered.filter(task=>

            task.text.toLowerCase().includes(searchText)

        );

    }

    return filtered;

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

function formatDueDate(date) {

    if (!date) return "";

    const due = new Date(date);

    const today = new Date();

    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate()+1);

    due.setHours(0,0,0,0);

    if(due.getTime()===today.getTime())
        return "📅 Today";

    if(due.getTime()===tomorrow.getTime())
        return "📅 Tomorrow";

    if(due<today)
        return " Overdue";

    return "📅 " + due.toLocaleDateString();
}

function displayTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    const visibleTasks = getFilteredTasks();

    visibleTasks.forEach(taskObj => {
        const li = document.createElement("li");

        const textWrapper = document.createElement("div");
        const textSpan = document.createElement("span");

        textSpan.innerText = taskObj.text;
        if(taskObj.completed)
         textSpan.classList.add("completed");

      const due = document.createElement("small");

      due.className = "due-date";

        due.innerText = formatDueDate(taskObj.dueDate);
        if(formatDueDate(taskObj.dueDate)==="Overdue")
        due.classList.add("overdue");

        textWrapper.appendChild(textSpan);

        textWrapper.appendChild(document.createElement("br"));

        textWrapper.appendChild(due);

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

        li.appendChild(textWrapper);
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
    const dueDate = document.getElementById("dueDate").value;
    if (taskText === "") return;

    try {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              text: taskText,
             dueDate
            })
        });

        if (!response.ok) throw new Error("Failed to create task");
        taskInput.value = "";
        document.getElementById("dueDate").value = "";
        await refreshTasks();
    } catch (error) {
        console.error(error);
        showError("Unable to save task. Make sure the server is running.");
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
        showSuccess("Task deleted successfully!");
    } catch (error) {
        console.error(error);
        showError("Unable to delete task.");
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
        showSuccess(
    task.completed
        ? "Task marked as active."
        : "Task marked as completed."
);
    } catch (error) {
        console.error(error);
        showError("Unable to update task status.");
    }
}


function editTask(taskId) {
    const task = tasks.find(item => item._id === taskId);

    if (!task) return;

    editTaskId = taskId;

    document.getElementById("editTaskInput").value = task.text;

    document
        .getElementById("editModal")
        .classList.add("show");

    document.getElementById("editTaskInput").focus();
}

function closeEditModal() {
    editTaskId = null;

    document
        .getElementById("editModal")
        .classList.remove("show");
}

async function saveEditedTask() {

    const text = document
        .getElementById("editTaskInput")
        .value
        .trim();

    if (text === "") {
        showError("Task cannot be empty.");
        return;
    }

    try {

        const response = await fetch(`${API_BASE}/tasks/${editTaskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
            text:text,
            dueDate: tasks.find(t=>t._id===editTaskId)?.dueDate || null
           })
        });

        if (!response.ok)
            throw new Error("Update failed");

        closeEditModal();

        await refreshTasks();

        showSuccess("Task updated successfully!");

    } catch (error) {

        console.error(error);

        showError("Unable to update task.");

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
        showSuccess("Completed tasks cleared.");
    } catch (error) {
        console.error(error);
        showError("Unable to clear completed tasks.");
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
document.getElementById("cancelEdit").onclick = closeEditModal;

document.getElementById("saveEdit").onclick = saveEditedTask;

document
    .getElementById("editTaskInput")
    .addEventListener("keydown", function (e) {

        if (e.key === "Enter") {
            saveEditedTask();
        }

    });