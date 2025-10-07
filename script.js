const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");
const totalTimeDisplay = document.querySelector(".time span");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let totalTime = parseFloat(localStorage.getItem("totalTime")) || 0;

function saveData(){
    localStorage.setItem('tasks',JSON.stringify(tasks));
    localStorage.setItem('totalTime',totalTime);
}

function renderTasks() {
    listContainer.innerHTML = "";
    tasks.forEach((task,index) => {
        const li = document.createElement("li");
        li.textContent =task.text;
        li.innerHTML = `
            <span contenteditable="false">${task.text}</span>
            <span class="timer">⏱ ${formatTime(task.time)}</span>
            <button class="start">▶</button>
            <button class="stop">⏹</button>
            <button class="edit">✎</button>
            <button class="delete">🗑</button>
        `;
        listContainer.appendChild(li);

        const startBtn = li.querySelector(".start");
        const stopBtn = li.querySelector(".stop");
        const editBtn = li.querySelector(".edit");
        const deleteBtn = li.querySelector(".delete");
        const textSpan = li.querySelector("span");
        const timerSpan = li.querySelector(".timer");

        startBtn.onclick = () => startTimer(index,timerSpan);
        stopBtn.onclick = () => stopTimer(index,timerSpan);
        editBtn.onclick = () => editTask(index,textSpan);
        deleteBtn.onclick = () => deleteTask(index);
    });
    totalTimeDisplay.textContent = totalTime.toFixed(1);
    saveData();
}

function addTask() {
    const text = inputBox.value.trim();
    if(text === ""){
        alert("Please enter your task!");
        return;
    }
    const task = {
        text,
        time : 0,
        timer : null,
        isRunning : false,
        startTime : null,
    };

    tasks.push(task);
    inputBox.value = "";
    renderTasks();

    saveData();
}

function startTimer(index,timerSpan){
    const task = tasks[index];
    if(task.isRunning) return;

    task.isRunning = true;
    task.startTime = Date.now();

    task.timer = setInterval(() => {
        const now = Date.now();
        const diff = (now - task.startTime) / 1000 /60;
        task.time = parseFloat(task.timeAtStop || 0) + diff;
        timerSpan.textContent = `⏱ ${formatTime(task.time)}`;
    }, 1000);
    saveData();
}

function stopTimer(index,timerSpan){
    const task = tasks[index];
    if(!task.isRunning) return;

    task.isRunning = false;
    clearInterval(task.timer);

    const now = Date.now();
    const diff = (now - task.startTime) / 1000/60;
    task.time = parseFloat(task.timeAtStop || 0) + diff;
    task.timeAtStop = task.time;
    totalTime += diff;

    timerSpan.textContent = `⏱ ${formatTime(task.time)}`;
    saveData();
    renderTasks();
    saveData();
}

function editTask(index,span) {
    span.contentEditable = true;
    span.focus();
    span.onblur = () => {
      span.contentEditable = false;
      tasks[index].texr = span.textContent.trim();
      saveData();
    }
}

function deleteTask(index){
    const task = tasks[index];
    if(task.isRunning) clearInterval(task.timer);
    totalTime -= task.time;
    tasks.splice(index,1);
    if(totalTime < 0) totalTime = 0;
    renderTasks();
}

function formatTime(minutes){
    const m = Math.floor(minutes);
    const s = Math.floor((minutes - m)*60);
    return `${m}:${s<10?"0":""}${s}min`;
}

document.getElementById("input-button").onclick = addTask;
inputBox.addEventListener("keypress", (e) => {
    if(e.key === "Enter") addTask();
});

window.addEventListener("load",renderTasks);