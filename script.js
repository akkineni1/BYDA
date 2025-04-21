// DOM Elements
const timer = document.getElementById('timer');
const timerLabel = document.getElementById('timer-label');
const progressBar = document.getElementById('progress-bar');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const focusTimeInput = document.getElementById('focus-time');
const breakTimeInput = document.getElementById('break-time');
const longBreakTimeInput = document.getElementById('long-break-time');
const pomodoroCountInput = document.getElementById('pomodoro-count');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const volumeControl = document.getElementById('volume-control');
const testSoundBtn = document.getElementById('test-sound');

// App State
let isRunning = false;
let timerInterval = null;
let currentMode = 'focus'; // 'focus', 'break', 'longBreak'
let secondsLeft = 0;
let totalSeconds = 0;
let completedPomodoros = 0;
let selectedTaskId = null;
let audioContext = null;

// Load saved tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('pomodoroTasks')) || [];

// Initialize Web Audio API for more reliable sound
function initAudio() {
    try {
        // Create AudioContext on first user interaction
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log("Audio context initialized");
        return true;
    } catch (e) {
        console.error("Web Audio API not supported", e);
        return false;
    }
}

// Play a beep sound using Web Audio API
function playBeep(frequency = 440, duration = 0.3, volume = 0.7) {
    if (!audioContext) {
        if (!initAudio()) return false;
    }
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = volume;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), duration * 1000);
        
        return true;
    } catch (e) {
        console.error("Error playing beep", e);
        return false;
    }
}

// Set default volume from the slider
function updateVolume() {
    const volume = volumeControl.value / 100;
    localStorage.setItem('pomodoroVolume', volume);
}

// Initialize app
function init() {
    updateTimerDisplay();
    renderTasks();
    
    // Load saved volume from localStorage
    const savedVolume = localStorage.getItem('pomodoroVolume');
    if (savedVolume !== null) {
        volumeControl.value = savedVolume * 100;
    }
    updateVolume();
    
    // Add event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    focusTimeInput.addEventListener('change', updateTimerDisplay);
    breakTimeInput.addEventListener('change', updateTimerDisplay);
    longBreakTimeInput.addEventListener('change', updateTimerDisplay);
    
    // Volume control
    volumeControl.addEventListener('input', updateVolume);
    testSoundBtn.addEventListener('click', () => {
        playSound('success');
    });
    
    // Button click sound
    [startBtn, pauseBtn, resetBtn, testSoundBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('buttonClick');
        });
    });
    
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }
    
    // Add page visibility change detection for better timer handling
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible' && isRunning) {
        // Recalculate time if page was hidden and timer was running
        updateTimerDisplay();
    }
}

// Sound functions with different frequencies for each sound type
function playSound(soundName) {
    const volume = volumeControl.value / 100;
    
    // Add visual feedback
    timer.classList.add('active');
    setTimeout(() => timer.classList.remove('active'), 300);
    
    switch(soundName) {
        case 'timerComplete':
            playBeep(783.99, 0.5, volume); // G5
            break;
        case 'buttonClick':
            playBeep(659.25, 0.08, volume * 0.6); // E5
            break;
        case 'success':
            // Play two tones for success
            playBeep(523.25, 0.1, volume); // C5
            setTimeout(() => playBeep(783.99, 0.2, volume), 150); // G5
            break;
        case 'taskComplete':
            playBeep(987.77, 0.15, volume); // B5
            break;
        default:
            playBeep(440, 0.3, volume); // A4 (default)
    }
}

// Timer functions
function startTimer() {
    if (isRunning) return;
    
    // Initialize audio on first user interaction
    if (!audioContext) initAudio();
    
    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    if (secondsLeft === 0) {
        // Initialize timer based on current mode
        switch (currentMode) {
            case 'focus':
                totalSeconds = focusTimeInput.value * 60;
                break;
            case 'break':
                totalSeconds = breakTimeInput.value * 60;
                break;
            case 'longBreak':
                totalSeconds = longBreakTimeInput.value * 60;
                break;
        }
        secondsLeft = totalSeconds;
    }
    
    timerInterval = setInterval(() => {
        secondsLeft--;
        updateTimerDisplay();
        updateProgressBar();
        
        // Add pulse animation to timer when less than 10 seconds left
        if (secondsLeft <= 10 && secondsLeft > 0) {
            timer.classList.add('completed-animation');
        } else {
            timer.classList.remove('completed-animation');
        }
        
        if (secondsLeft <= 0) {
            completeTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    secondsLeft = 0;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    progressBar.style.width = '0%';
    timer.classList.remove('completed-animation');
    timer.classList.remove('active');
    updateTimerDisplay();
}

function completeTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    // Play different sounds based on which timer completed
    if (currentMode === 'focus') {
        playSound('success');
    } else {
        playSound('timerComplete');
    }
    
    // Apply completion animation
    timer.classList.add('completed-animation');
    setTimeout(() => {
        timer.classList.remove('completed-animation');
    }, 700);
    
    // Show notification
    showNotification();
    
    // Update current mode and completed pomodoros
    if (currentMode === 'focus') {
        completedPomodoros++;
        
        // Update task completion if a task is selected
        if (selectedTaskId) {
            const taskIndex = tasks.findIndex(task => task.id === selectedTaskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].completedPomodoros++;
                renderTasks();
                saveTasks();
            }
        }
        
        // Check if it's time for a long break
        if (completedPomodoros % parseInt(pomodoroCountInput.value) === 0) {
            currentMode = 'longBreak';
            timerLabel.textContent = 'Long Break';
            document.body.style.backgroundColor = '#fff3e6';
        } else {
            currentMode = 'break';
            timerLabel.textContent = 'Break Time';
            document.body.style.backgroundColor = '#ffdfd1';
        }
    } else {
        currentMode = 'focus';
        timerLabel.textContent = 'Focus Time';
        document.body.style.backgroundColor = '#fff3e6';
    }
    
    secondsLeft = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (secondsLeft === 0) {
        // Show the initial time based on settings
        switch (currentMode) {
            case 'focus':
                secondsLeft = focusTimeInput.value * 60;
                break;
            case 'break':
                secondsLeft = breakTimeInput.value * 60;
                break;
            case 'longBreak':
                secondsLeft = longBreakTimeInput.value * 60;
                break;
        }
        totalSeconds = secondsLeft;
    }
    
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update document title to show timer and mode
    document.title = `${timer.textContent} - ${timerLabel.textContent}`;
}

function updateProgressBar() {
    const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
    progressBar.style.width = `${progress}%`;
}

// Task functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') return;
    
    playSound('buttonClick');
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        completedPomodoros: 0
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Animate the task list to draw attention to the new task
    taskList.classList.add('completed-animation');
    setTimeout(() => {
        taskList.classList.remove('completed-animation');
    }, 600);
    
    taskInput.value = '';
    taskInput.focus();
}

function saveTasks() {
    localStorage.setItem('pomodoroTasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.id === selectedTaskId) {
            li.classList.add('selected-task');
        }
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompleted(task.id));
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        if (task.completed) taskText.classList.add('completed');
        taskText.textContent = task.text;
        
        const pomCount = document.createElement('span');
        pomCount.className = 'pomodoro-count';
        pomCount.textContent = task.completedPomodoros > 0 ? `${task.completedPomodoros} 🍅` : '';
        
        taskContent.appendChild(checkbox);
        taskContent.appendChild(taskText);
        if (task.completedPomodoros > 0) {
            taskContent.appendChild(pomCount);
        }
        
        const taskControls = document.createElement('div');
        taskControls.className = 'task-controls';
        
        const selectBtn = document.createElement('button');
        selectBtn.innerHTML = '<i class="fas fa-play"></i>';
        selectBtn.title = 'Work on this task';
        selectBtn.addEventListener('click', () => selectTask(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskControls.appendChild(selectBtn);
        taskControls.appendChild(deleteBtn);
        
        li.appendChild(taskContent);
        li.appendChild(taskControls);
        
        taskList.appendChild(li);
    });
}

function toggleTaskCompleted(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        // Play sound when task is completed
        if (tasks[taskIndex].completed) {
            playSound('taskComplete');
        }
        
        saveTasks();
        renderTasks();
    }
}

function selectTask(taskId) {
    playSound('buttonClick');
    selectedTaskId = taskId === selectedTaskId ? null : taskId;
    renderTasks();
}

function deleteTask(taskId) {
    playSound('buttonClick');
    tasks = tasks.filter(task => task.id !== taskId);
    if (selectedTaskId === taskId) {
        selectedTaskId = null;
    }
    saveTasks();
    renderTasks();
}

// Notification functions
function showNotification() {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
        let title, message, icon;
        
        if (currentMode === 'focus') {
            title = '🎉 Break Time!';
            message = 'Great job! Time to take a break.';
            icon = 'https://cdn-icons-png.flaticon.com/512/6134/6134116.png';
        } else {
            title = '🚀 Focus Time!';
            message = 'Break is over. Time to focus!';
            icon = 'https://cdn-icons-png.flaticon.com/512/6134/6134661.png';
        }
        
        const notification = new Notification(title, {
            body: message,
            icon: icon,
            silent: true // We'll play our own sounds
        });
        
        // Close notification after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init); 