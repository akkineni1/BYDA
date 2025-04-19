document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const startBtn = document.getElementById('start');
    const pauseBtn = document.getElementById('pause');
    const resetBtn = document.getElementById('reset');
    const pomodoroBtn = document.getElementById('pomodoro');
    const shortBreakBtn = document.getElementById('short-break');
    const longBreakBtn = document.getElementById('long-break');
    const sessionCountEl = document.getElementById('session-count');
    const workRestToggleBtn = document.getElementById('work-rest-toggle');
    const container = document.querySelector('.container');

    // Timer settings
    const timerSettings = {
        pomodoro: 25 * 60, // 25 minutes in seconds
        shortBreak: 5 * 60, // 5 minutes in seconds
        longBreak: 15 * 60 // 15 minutes in seconds
    };

    // Timer state
    let currentTimer = 'pomodoro';
    let timeLeft = timerSettings[currentTimer];
    let timerInterval = null;
    let isTimerRunning = false;
    let sessionCount = 0;
    let isWorkMode = true;

    // Audio notification
    const timerEndSound = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

    // Update timer display
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
        
        // Update page title to show current timer
        document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Focus Timer`;
        
        // Update progress indication (less than 20% of time remaining)
        if (timeLeft <= timerSettings[currentTimer] * 0.2 && isTimerRunning) {
            container.classList.add('urgent');
        } else {
            container.classList.remove('urgent');
        }
    }

    // Start timer
    function startTimer() {
        if (isTimerRunning) return;
        
        // Add animation
        startBtn.classList.add('pulse');
        setTimeout(() => {
            startBtn.classList.remove('pulse');
        }, 700);
        
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                isTimerRunning = false;
                timerEndSound.play();
                
                // Notification
                showNotification();
                
                // Add completion animation to container
                container.classList.add('completed');
                setTimeout(() => {
                    container.classList.remove('completed');
                }, 1000);
                
                // If pomodoro session completed, increase session count
                if (currentTimer === 'pomodoro') {
                    sessionCount++;
                    sessionCountEl.textContent = sessionCount;
                    
                    // After 4 pomodoros, take a long break, otherwise take a short break
                    if (sessionCount % 4 === 0) {
                        switchTimer('longBreak');
                    } else {
                        switchTimer('shortBreak');
                    }
                } else {
                    // After a break, go back to pomodoro
                    switchTimer('pomodoro');
                }
            }
        }, 1000);
    }

    // Show notification when timer ends
    function showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Timer Complete!', {
                body: currentTimer === 'pomodoro' ? 'Time for a break!' : 'Time to focus!',
                icon: './favicon.ico' // Add a favicon to your project for this
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }

    // Pause timer
    function pauseTimer() {
        clearInterval(timerInterval);
        isTimerRunning = false;
        
        // Add animation
        pauseBtn.classList.add('pulse');
        setTimeout(() => {
            pauseBtn.classList.remove('pulse');
        }, 700);
    }

    // Reset timer
    function resetTimer() {
        pauseTimer();
        timeLeft = timerSettings[currentTimer];
        updateTimerDisplay();
        
        // Add animation
        resetBtn.classList.add('pulse');
        setTimeout(() => {
            resetBtn.classList.remove('pulse');
        }, 700);
    }

    // Switch timer mode
    function switchTimer(mode) {
        pauseTimer();
        
        // Add transition animation
        container.classList.add('mode-switching');
        setTimeout(() => {
            container.classList.remove('mode-switching');
        }, 500);
        
        // Remove active class from all mode buttons
        pomodoroBtn.classList.remove('active');
        shortBreakBtn.classList.remove('active');
        longBreakBtn.classList.remove('active');
        
        // Update body class for background color
        document.body.classList.remove('pomodoro', 'short-break', 'long-break');
        
        // Set new timer mode
        currentTimer = mode;
        timeLeft = timerSettings[mode];
        
        // Update active button and body class
        if (mode === 'pomodoro') {
            pomodoroBtn.classList.add('active');
            document.body.classList.add('pomodoro');
            // If switching to pomodoro, update work/rest mode to work
            if (!isWorkMode) {
                toggleWorkRestMode();
            }
        } else if (mode === 'shortBreak') {
            shortBreakBtn.classList.add('active');
            document.body.classList.add('short-break');
            // If switching to a break, update work/rest mode to rest
            if (isWorkMode) {
                toggleWorkRestMode();
            }
        } else if (mode === 'longBreak') {
            longBreakBtn.classList.add('active');
            document.body.classList.add('long-break');
            // If switching to a break, update work/rest mode to rest
            if (isWorkMode) {
                toggleWorkRestMode();
            }
        }
        
        updateTimerDisplay();
    }

    // Toggle between work and rest modes
    function toggleWorkRestMode() {
        isWorkMode = !isWorkMode;
        
        // Add animation
        workRestToggleBtn.classList.add('flipping');
        setTimeout(() => {
            workRestToggleBtn.classList.remove('flipping');
        }, 600);
        
        if (isWorkMode) {
            workRestToggleBtn.innerHTML = '<i class="fas fa-briefcase"></i> Work Mode';
            workRestToggleBtn.classList.remove('rest-mode');
            workRestToggleBtn.classList.add('work-mode');
            switchTimer('pomodoro');
        } else {
            workRestToggleBtn.innerHTML = '<i class="fas fa-coffee"></i> Rest Mode';
            workRestToggleBtn.classList.remove('work-mode');
            workRestToggleBtn.classList.add('rest-mode');
            // Choose short break by default when switching to rest mode
            switchTimer('shortBreak');
        }
    }

    // Event listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    pomodoroBtn.addEventListener('click', () => switchTimer('pomodoro'));
    shortBreakBtn.addEventListener('click', () => switchTimer('shortBreak'));
    longBreakBtn.addEventListener('click', () => switchTimer('longBreak'));
    workRestToggleBtn.addEventListener('click', toggleWorkRestMode);

    // Request notification permission
    if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    // Initialize timer display
    updateTimerDisplay();
    
    // Set initial timer mode
    switchTimer('pomodoro');
}); 