# Pomodoro Timer Web App (Version 2)

A simple, browser-based Pomodoro Timer application to boost your productivity, featuring a beautiful peach theme and reliable sound system.

## Features

- Customizable focus, break, and long break durations
- Beautiful peach gradient theme with modern design
- Reliable sound alerts using Web Audio API
- Visual progress bar
- Task management system
- Browser notifications when timer completes
- Responsive design that works on any device
- Local storage to save your tasks

## How to Use

1. **Set Up Timer**:
   - Customize focus time, break time, and long break duration in the settings
   - Set how many pomodoros until a long break
   - Adjust sound volume with the slider

2. **Add Tasks**:
   - Enter tasks in the input field
   - Click the "+" button or press Enter to add them to your list
   - Select a task to work on by clicking the play button next to it

3. **Start the Timer**:
   - Click the "Start" button to begin the timer
   - The progress bar will show your progress
   - When the timer completes, a notification will appear and a sound will play

4. **Manage Tasks**:
   - Check off completed tasks
   - Delete tasks you no longer need
   - Track how many pomodoros you've spent on each task

## Getting Started

To use this app, simply open the `index.html` file in your web browser. No installation or internet connection required after the initial load.

```bash
# If you have Python installed, you can run a simple server with:
python3 -m http.server 8080

# Or with Node.js:
npx serve
```

Then open your browser and navigate to `http://localhost:8080` (for Python) or `http://localhost:3000` (for Node.js serve).

## Browser Compatibility

This app works in all modern browsers that support:
- ES6+ JavaScript
- CSS Flexbox/Grid
- Web Notifications API
- Web Audio API
- Local Storage API

## License

This project is open source and available under the MIT License. 