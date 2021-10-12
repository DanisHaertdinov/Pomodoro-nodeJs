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

const playSound = async (soundPath, duration = 10) => {
  const readStream = await StupidPlayer.getReadStream(soundPath);
  await player.play(readStream);
  setTimeout(() => {
    player.stop();
  }, duration * 1000);
};

let timerId = null;
let startTime = null;
let remainingTime = null;
let pomodoroCount = 0;

const isLongRestTime = () => {
  return pomodoroCount / LONG_REST_COUNT === 0;
};

const sendMessage = (message) => {
  console.log(message);
};

const setTimer = (callback, duration, command) => {
  switch (command) {
    case Commands.RUN:
      if (timerId !== null) {
        return;
      }
      startTime = Date.now();
      remainingTime = duration;
      timerId = setTimeout(() => {
        timerId = null;
        callback();
      }, duration);
      break;
    case Commands.PAUSE:
      clearTimeout(timerId);
      remainingTime -= Date.now() - startTime;
      sendMessage(`on pause ${remainingTime / 1000} seconds remaining`);
      break;
    case Commands.RESUME:
      sendMessage(`Pomodoro resume`);
      startTime = Date.now();
      timerId = setTimeout(() => {
        timerId = null;
        callback();
      }, remainingTime);
  }
};

const setupPomodoro = (command) => {
  sendMessage(`Pomodoro starts`);
  setTimer(
    async () => {
      const duration = isLongRestTime() ? LONG_REST_TIME : REST_TIME;
      const message = isLongRestTime()
        ? `take a short break`
        : `well done take a long break`;
      sendMessage(message);
      await playSound(SOUND_PATH);
      setTimer(
        async () => {
          await playSound(SOUND_PATH);
          sendMessage(`prepare to new challenge`);
          pomodoroCount++;
        },
        duration,
        Commands.RUN
      );
    },
    WORK_TIME,
    command
  );
};

const main = () => {
  if (arg) {
    setupPomodoro(arg);
  }

  rl.on("line", (input) => {
    setupPomodoro(input);
  });
};

main();
