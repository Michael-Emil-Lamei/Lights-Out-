const reactButton = document.querySelector("#reaction_button");
const lights = document.querySelectorAll(".light");
const statusDisplay = document.querySelector("#system_status");
const resultValue = document.querySelector("#r-value");
const statBest = document.querySelector("#stat-best");
const statAverage = document.querySelector("#stat-average");
const statAttempts = document.querySelector("#stat-attempts");
const statFalseStarts = document.querySelector("#stat-false");
const audioContext = new AudioContext();


let lightsOutTime;
let reactionTime;
let lightTimers = [];
let goTimer;
let validAttempts = 0;
let personalBest = null;
let totalReactionTime = 0;
let falseStartCount = 0;
let tensionHum = null;

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

function playTone(frequency, duration, volume) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
}

function startHum(frequency, volume) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);

    return { oscillator, gainNode }
}

function stopHum(hum) {
    const now = audioContext.currentTime;
    hum.gainNode.gain.cancelScheduledValues(now);
    hum.gainNode.gain.setValueAtTime(hum.gainNode.gain.value, now);
    hum.gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
    hum.oscillator.stop(now + 0.15);
}

function playSuccessSound(time) {
    if (time < 250) {
        playTone(520, 0.12, 0.2);
        playTone(780, 0.1, 0.15);
    } else {
        playTone(520, 0.1, 0.15);
    }
}

function playFalseSound() {
    playTone(320, 0.1, 0.18);
    playTone(180, 0.15, 0.18);
}

function playPrSound() {
    playTone(600, 0.08, 0.15);
    setTimeout(function () {
        playTone(900, 0.15, 0.2);
    }, 80);
}

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

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    playTone(660, 0.1, 0.15);

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
            playTone(300 + i * 40, 0.08, 0.08 + i * 0.02);
        },   (i + 1) * 1000);
        lightTimers.push(timerId);
    }

    const humStartTimer = setTimeout(function () {
        tensionHum = startHum(90, 0.03);
    }, lights.length * 1000);
    lightTimers.push(humStartTimer);

    const randomDelay = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;

    goTimer = setTimeout(function (){
        if (tensionHum) {
            stopHum(tensionHum);
            tensionHum = null;
        }

        lights.forEach(function (light) {
            light.classList.remove("on");
        });
        lightsOutTime = Date.now();
        playTone(150, 0.12, 0.25);
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
            playPrSound();
        }

        totalReactionTime = totalReactionTime + reactionTime;

        playSuccessSound(reactionTime);

        showResult(false);
    }
}

function handleFalseStart() {
    lightTimers.forEach(function (timerId) {
        clearTimeout(timerId);
    });
    clearTimeout(goTimer);

    if (tensionHum) {
        stopHum(tensionHum);
        tensionHum = null;
    }

    lights.forEach(function (light) {
        light.classList.remove("on");
    });

    updateGameState(GAME_STATE.FALSE_START);
    falseStartCount = falseStartCount + 1;
    playFalseSound();
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

