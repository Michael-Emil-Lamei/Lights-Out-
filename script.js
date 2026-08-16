const reactButton = document.querySelector("#reaction-button");
const lights = document.querySelectorAll(".light");
const resultsDisplay = document.querySelector("#results");

let lightsOutTime;
let reactionTime;

function startGame() {

    lights.forEach(function (light) {
        light.classList.remove("on");
    });
    resultsDisplay.textContent = "";
    lightsOutTime = undefined;

    for (let i = 0; i < lights.length; i++) {
        setTimeout(function () {
            lights[i].classList.add("on");
        },   (i + 1) * 1000);
    }

    const randomDelay = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;

    setTimeout(function (){
        lights.forEach(function (light) {
            light.classList.remove("on");
        });
        lightsOutTime = Date.now();
        console.log("lights out at:", lightsOutTime);
    }, 5000 + randomDelay);
}

function handleReactionClick() {
    if (lightsOutTime) {
        const clickTime = Date.now();
        reactionTime = clickTime - lightsOutTime;
        console.log("Reaction Time:", reactionTime, "ms");
        resultsDisplay.textContent = "Reaction Time:" + reactionTime + "ms";
        lightsOutTime = undefined;
    }
}



reactButton.addEventListener("click", startGame);
document.addEventListener("click", handleReactionClick);

