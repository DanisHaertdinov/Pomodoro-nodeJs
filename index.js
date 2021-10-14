const readline = require("readline");
const StupidPlayer = require("stupid-player").StupidPlayer;
const path = require("path");
const Timer = require('./timer');

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

const Status = {
  IDLE: `idle`,
  WORK: `work`,
  REST: `rest`,
};

class Deferred {
  constructor() {
    this._promise = new Promise((resolve, reject) => {
        this._resolve = resolve;
        this._reject = reject;
    });
  }
  getPromise() {
    return this._promise;
  }
  resolve() {
    this._resolve();
  }

  reject() {}
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
let remainingTime = WORK_TIME;
let isWorkTime = true;
let status = Status.IDLE;

const isLongRestTime = () => {
  return pomodoroCount / LONG_REST_COUNT === 0;
};

const sendMessage = (message) => {
  console.log(message);
};

const startWorkTimer = async () => {
  status = Status.WORK;
  activeTimer = pomodoroWorkTimer;
  const message = isLongRestTime()
    ? `take a short break`
    : `well done take a long break`;

  await pomodoroWorkTimer.start(remainingTime);

  sendMessage(message);
  playSound(SOUND_PATH);
};

const startRestTimer = async () => {
  status = Status.REST;
  activeTimer = pomodoroRestTimer;

  await pomodoroRestTimer.start(remainingTime);

  sendMessage(`prepare to new challenge`);
  playSound(SOUND_PATH);
  pomodoroCount++;
};

let deferred = new Deferred();

const iteration = async (status) => {
  switch (status) {
    case Status.WORK:
      await startWorkTimer();  
      break;
  }
}

const statuses = [Status.WORK, Status.REST, Status.WORK, Status.REST, Status.WORK, Status.LONG_REST];

for (c of statuses) {
  await iteration(c);
}

const startTimers = async () => {
  if (status === Status.IDLE || status === Status.WORK) {
    await startWorkTimer();
    remainingTime = isLongRestTime() ? LONG_REST_TIME : REST_TIME;
    return await startTimers();
  }


  await startRestTimer();
  status = Status.IDLE;
};

// workTime -> restTime

const setupPomodoro = async (command) => {
  switch (command) {
    case Commands.RUN:
      if (status !== Status.IDLE) {
        return;
      }
      sendMessage(`Pomodoro starts`);
      status = Status.WORK;
      await startTimers();
      break;
    case Commands.PAUSE:
      activeTimer.pause();
      remainingTime = activeTimer.remainingTime;
      sendMessage(
        `on pause ${activeTimer.remainingTime / 1000} seconds remaining`
      );
      break;
    case Commands.RESUME:
      sendMessage(`Pomodoro resume`);
      await startTimers();
  }
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
