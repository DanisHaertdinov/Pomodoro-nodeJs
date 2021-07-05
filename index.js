const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const arg = process.argv[2]

const WORK_TIME = 50000;
const REST_TIME = 20000;
const LONG_REST_TIME = 40000;
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

const timer = (duration, callback, command) => {
    switch (command) {
        case Commands.RUN:
            console.log(`Pomodoro starts`)
            startTime = Date.now()
            remainingTime = duration;
            timerId = setTimeout(() => {
                callback();
            }, duration)
            break;
        case Commands.PAUSE:
            clearTimeout(timerId);
            remainingTime -= (Date.now() - startTime);
            console.log(`on pause ${remainingTime / 1000} seconds remaining`)
            break;
        case Commands.RESUME:
            console.log(`Pomodoro resume`)
            startTime = Date.now()
            timerId = setTimeout(() => {
                callback();
            }, remainingTime)
    }
}

const setupTimer = (command) => {
    timer(
        WORK_TIME,
        () => {
            const duration = isLongRestTime() ? LONG_REST_TIME : REST_TIME;
            const message = isLongRestTime() ? `take a short break` : `well done take a long break`;
            console.log(message);

            timer(
                duration,
                () => {
                    console.log(`prepare to new challenge`);
                },
                Commands.RUN
            )
        },
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

