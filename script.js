const reactButton = document.querySelector("#reaction-button");
const lights = document.querySelectorAll(".light");
const resultsDisplay = document.querySelector("#results");

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

let currentState = GAME_STATE.IDLE;


function startGame(event) {
    event.stopPropagation();

    lightTimers.forEach(function (timerId) {
        clearTimeout(timerId);
    });
    clearTimeout(goTimer);
    
    currentState = GAME_STATE.COUNTDOWN;

    lights.forEach(function (light) {
        light.classList.remove("on");
    });
    resultsDisplay.textContent = "";
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
        currentState = GAME_STATE.GO;
        console.log("lights out at:", lightsOutTime);
    }, 5000 + randomDelay);
}

function handleReactionClick() {
    if (currentState === GAME_STATE.COUNTDOWN) {
        handleFalseStart();
    } else if (currentState === GAME_STATE.GO) {
        const clickTime = Date.now();
        reactionTime = clickTime - lightsOutTime;
        currentState = GAME_STATE.RESULT;
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

    currentState = GAME_STATE.FALSE_START;
    falseStartCount = falseStartCount + 1;
    showResult(true);
}

function showResult(isFalseStart) {
    if (isFalseStart) {
        resultsDisplay.textContent = "False Start. Wait Until the Lights Go Out!" + " - False Starts: " + falseStartCount;
    } else {
        const averageReactionTime = Math.round(totalReactionTime / validAttempts);

        resultsDisplay.textContent = "Reaction Time: " + reactionTime + "ms" + " - PR: " + personalBest + "ms" + " - Average: " + averageReactionTime + "ms" + " - Attempts: " + validAttempts + " - false starts: " + falseStartCount;
    }
}


reactButton.addEventListener("click", startGame);
document.addEventListener("click", handleReactionClick);

