const readline = require("readline");
const StupidPlayer = require("stupid-player").StupidPlayer;
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const arg = process.argv[2];
const player = new StupidPlayer();

const WORK_TIME = 15 * 1000;
const REST_TIME = 12 * 1000;
const LONG_REST_TIME = 14 * 1000;
const LONG_REST_COUNT = 4;
const SOUND_PATH = path.resolve("./sounds/sound.mp3");

const Commands = {
  RUN: `run`,
  RESUME: `resume`,
  PAUSE: `pause`,
};

class Timer {
  #startTime = null;
  remainingTime = null;
  #timerId = null;

  start(duration) {
    this.#startTime = Date.now();
    this.remainingTime = this.#timerId ? this.remainingTime : duration;

    return new Promise((resolve) => {
      this.#timerId = setTimeout(() => {
        this.reset();
        resolve();
      }, this.remainingTime);
    });
  }

  pause() {
    clearTimeout(this.#timerId);
    this.remainingTime -= Date.now() - this.#startTime;
  }

  reset() {
    this.#startTime = null;
    this.remainingTime = null;
    this.#timerId = null;
  }
}

const playSound = (soundPath, duration = 10) => {
  const timer = new Timer();
  StupidPlayer.getReadStream(soundPath)
    .then((readStream) => {
      return player.play(readStream);
    })
    .then(() => {
      return timer.start(duration * 1000);
    })
    .then(() => {
      return player.stop();
    });
};

const pomodoroWorkTimer = new Timer();
const pomodoroRestTimer = new Timer();
let activeTimer = null;
let pomodoroCount = 0;

const isLongRestTime = () => {
  return pomodoroCount / LONG_REST_COUNT === 0;
};

const sendMessage = (message) => {
  console.log(message);
};

const setWorkTimer = async () => {
  activeTimer = pomodoroWorkTimer;
  const message = isLongRestTime()
    ? `take a short break`
    : `well done take a long break`;

  await pomodoroWorkTimer.start(WORK_TIME);

  sendMessage(message);
  playSound(SOUND_PATH);
};

const setRestTimer = async () => {
  activeTimer = pomodoroRestTimer;
  const duration = isLongRestTime() ? LONG_REST_TIME : REST_TIME;

  await pomodoroRestTimer.start(duration);

  sendMessage(`prepare to new challenge`);
  playSound(SOUND_PATH);
  pomodoroCount++;
};

const setTimer = async (command) => {
  switch (command) {
    case Commands.RUN:
      if (activeTimer !== null) {
        return;
      }
      sendMessage(`Pomodoro starts`);
      await setWorkTimer();
      await setRestTimer();
      break;
    case Commands.PAUSE:
      activeTimer.pause();
      sendMessage(
        `on pause ${activeTimer.remainingTime / 1000} seconds remaining`
      );
      break;
    case Commands.RESUME:
      sendMessage(`Pomodoro resume`);
      await activeTimer.start();
  }
};

const main = () => {
  if (arg) {
    setTimer(arg);
  }

  rl.on("line", (input) => {
    setTimer(input);
  });
};

main();
