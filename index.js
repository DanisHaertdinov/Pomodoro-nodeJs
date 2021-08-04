const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const arg = process.argv[2]

const WORK_TIME = 5  * 1000;
const REST_TIME = 2 * 1000;
const LONG_REST_TIME = 4 * 1000;
const LONG_REST_COUNT = 4;

const Commands = {
    RUN: `run`,
    RESUME: `resume`,
    PAUSE: `pause`,
}

let timerId = null;
let startTime = null;
let remainingTime = null;
let pomodoroCount = 0;

const isLongRestTime = () => {
    return  pomodoroCount / LONG_REST_COUNT === 0;
}

const timer = (callback,duration, command) => {
    switch (command) {
        case Commands.RUN:
            if (timerId !== null) {
                return
            }
            console.log(`Pomodoro starts`);
            startTime = Date.now()
            remainingTime = duration;
            timerId = setTimeout(() => {
                timerId = null;
                callback();
            }, duration);
            break;
        case Commands.PAUSE:
            clearTimeout(timerId);
            remainingTime -= (Date.now() - startTime);
            console.log(`on pause ${remainingTime / 1000} seconds remaining`);
            break;
        case Commands.RESUME:
            console.log(`Pomodoro resume`);
            startTime = Date.now();
            timerId = setTimeout(() => {
                timerId = null;
                callback();
            }, remainingTime);
    }
}

const setupTimer = (command) => {
    timer(
        () => {
            const duration = isLongRestTime() ? LONG_REST_TIME : REST_TIME;
            const message = isLongRestTime() ? `take a short break` : `well done take a long break`;
            console.log(message);

            timer(
                () => {
                    console.log(`prepare to new challenge`);
                    pomodoroCount++;
                },
                duration,
                Commands.RUN
            )
        },
        WORK_TIME,
        command
    )
}

const main = async () => {
    if (arg) {
        setupTimer(arg)
    }

    rl.on('line', (input) => {
        setupTimer(input)
    });
};

main();

