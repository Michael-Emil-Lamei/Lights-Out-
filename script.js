const reactButton = document.querySelector("#reaction_button");
const lights = document.querySelectorAll(".light");
const statusDisplay = document.querySelector("#system_status");
const resultValue = document.querySelector("#r-value");
const statBest = document.querySelector("#stat-best");
const statAverage = document.querySelector("#stat-average");
const statAttempts = document.querySelector("#stat-attempts");
const statFalseStarts = document.querySelector("#stat-false");



let lightsOutTime;
let reactionTime;
let lightTimers = [];
let goTimer;
let validAttempts = 0;
let personalBest = null;
let totalReactionTime = 0;
let falseStartCount = 0;

const GAME_STATE = {
    IDLE: "idle",
    COUNTDOWN: "countdown",
    GO: "go",
    RESULT: "result",
    FALSE_START: "falseStart",
};

const STATUS_MESSAGES = {
    [GAME_STATE.IDLE]: "Ready",
    [GAME_STATE.COUNTDOWN]: "Start Sequence",
    [GAME_STATE.GO]: "Lights Out",
    [GAME_STATE.RESULT]: "Valid Start",
    [GAME_STATE.FALSE_START]: "False Start",
};

let currentState = GAME_STATE.IDLE;

function updateGameState(newState) {
    currentState = newState;
    document.body.dataset.state = newState;
    statusDisplay.textContent = STATUS_MESSAGES[newState];

    statusDisplay.style.animation = "none";
    statusDisplay.offsetWidth;
    statusDisplay.style.animation = "";

    const roundInProgress = newState === GAME_STATE.COUNTDOWN;
    reactButton.disabled = roundInProgress;
}


function startGame(event) {
    event.stopPropagation();

    lightTimers.forEach(function (timerId) {
        clearTimeout(timerId);
    });
    clearTimeout(goTimer);

    updateGameState(GAME_STATE.COUNTDOWN);

    lights.forEach(function (light) {
        light.classList.remove("on");
    });
    lightsOutTime = undefined;

    lightTimers = [];

    for (let i = 0; i < lights.length; i++) {
        const timerId = setTimeout(function () {
            lights[i].classList.add("on");
        },   (i + 1) * 1000);
        lightTimers.push(timerId);
    }

    const randomDelay = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;

    goTimer = setTimeout(function (){
        lights.forEach(function (light) {
            light.classList.remove("on");
        });
        lightsOutTime = Date.now();
        updateGameState(GAME_STATE.GO);
        console.log("lights out at:", lightsOutTime);
    }, 5000 + randomDelay);
}

function handleReactionClick() {
    if (currentState === GAME_STATE.COUNTDOWN) {
        handleFalseStart();
    } else if (currentState === GAME_STATE.GO) {
        const clickTime = Date.now();
        reactionTime = clickTime - lightsOutTime;
        updateGameState(GAME_STATE.RESULT);
        lightsOutTime = undefined;
        validAttempts = validAttempts + 1;

        if (personalBest === null || reactionTime < personalBest) {
            personalBest = reactionTime;
        }

        totalReactionTime = totalReactionTime + reactionTime;

        showResult(false);
    }
}

function handleFalseStart() {
    lightTimers.forEach(function (timerId) {
        clearTimeout(timerId);
    });
    clearTimeout(goTimer);

    lights.forEach(function (light) {
        light.classList.remove("on");
    });

    updateGameState(GAME_STATE.FALSE_START);
    falseStartCount = falseStartCount + 1;
    showResult(true);
}

function showResult(isFalseStart) {
    if (isFalseStart) {
        resultValue.textContent = "-";
    } else {
        resultValue.textContent = reactionTime;

        const averageReactionTime = Math.round(totalReactionTime / validAttempts);
        statBest.textContent = personalBest + "ms";
        statAverage.textContent = averageReactionTime + "ms";
        statAttempts.textContent = validAttempts;
    }

    statFalseStarts.textContent = falseStartCount;
}


reactButton.addEventListener("click", startGame);
document.addEventListener("click", handleReactionClick);

