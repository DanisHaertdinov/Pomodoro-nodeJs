const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const arg = process.argv[2]
const WORK_TIME = 50000;

const Commands = {
    RUN: `run`,
    RESUME: `resume`,
    PAUSE: `pause`,
}

let timerId = null;
let startTime = null;
let remainingTime = null;

const timer = () => {
    switch (command) {
        case Commands.RUN:
            console.log(`Pomodoro starts`)
            startTime = Date.now()
            remainingTime = WORK_TIME;
            timerId = setTimeout(() => {
                console.log(`get rest`)
            }, WORK_TIME)
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
                console.log(`get rest`)
            }, remainingTime)
    }
}

const main = async () => {
    if (arg) {
        timer(arg)
    }

    rl.on('line', (input) => {
        timer(input)
    });
};

main();

