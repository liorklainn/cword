let words = [];
let selectedWords = [];
let currentQuestionIndex = 0;
let score = 0;
let timeLeft;
let lettersToRemove;
const maxQuestions = 10;
let highScores = []; // Leaderboard

async function loadWords() {
    try {
        const response = await fetch('words.json');
        words = await response.json();
    } catch (error) {
        console.error("Failed to load words:", error);
    }
}

function setLevel(level) {
    if (level === "easy") {
        timeLeft = 90;
        lettersToRemove = 2;
    } else if (level === "medium") {
        timeLeft = 60;
        lettersToRemove = 3;
    } else {
        timeLeft = 45;
        lettersToRemove = 4;
    }

    selectedWords = [];
    while (selectedWords.length < maxQuestions) {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        if (!selectedWords.includes(randomWord)) {
            selectedWords.push(randomWord);
        }
    }

    startGame();
}

function startGame() {
    document.querySelector(".level-selection").style.display = "none";
    document.getElementById("gameInterface").style.display = "block";
    score = 0;
    currentQuestionIndex = 0;
    updateScore();
    updateProgress();
    displayQuestion();
    startTimer();
}

function createQuestion(word) {
    const numLettersToRemove = Math.min(lettersToRemove, word.length - 1);
    const wordArray = word.split('');
    const indicesToRemove = new Set();

    while (indicesToRemove.size < numLettersToRemove) {
        const randomIndex = Math.floor(Math.random() * word.length);
        if (!indicesToRemove.has(randomIndex) && wordArray[randomIndex] !== '_') {
            indicesToRemove.add(randomIndex);
        }
    }

    const questionHTML = wordArray.map((letter, index) => 
        indicesToRemove.has(index) 
            ? `<input type="text" maxlength="1" class="letter-input" data-index="${index}" oninput="jumpToNextInput(this)" />` 
            : letter
    ).join('');
    
    return questionHTML;
}

function displayQuestion() {
    if (currentQuestionIndex >= maxQuestions || currentQuestionIndex >= selectedWords.length) {
        endGame();
        return;
    }

    const question = selectedWords[currentQuestionIndex];
    const wordWithInputs = createQuestion(question.word);

    document.getElementById("wordDisplay").innerHTML = `Word: ${wordWithInputs}`;
    document.getElementById("hint").textContent = question.hint;

    const firstInput = document.querySelector('.letter-input');
    if (firstInput) firstInput.focus();

    const feedbackElement = document.getElementById("feedback");
    feedbackElement.style.display = "block";
    feedbackElement.textContent = "";
}

function jumpToNextInput(currentInput) {
    if (currentInput.value.length === 1) {
        let nextInput = currentInput.nextElementSibling;
        while (nextInput && nextInput.tagName !== "INPUT") {
            nextInput = nextInput.nextElementSibling;
        }
        if (nextInput) nextInput.focus();
    }
}

function getUserAnswer() {
    const inputs = document.querySelectorAll('.letter-input');
    const wordArray = selectedWords[currentQuestionIndex].word.split('');

    inputs.forEach(input => {
        const index = input.getAttribute('data-index');
        wordArray[index] = input.value || '_';
    });

    return wordArray.join('');
}

function submitAnswer() {
    const userAnswer = getUserAnswer();
    const correctAnswer = selectedWords[currentQuestionIndex].word;
    const feedbackElement = document.getElementById("feedback");

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        score++;
        feedbackElement.textContent = "Correct!";
        feedbackElement.className = "feedback correct";
    } else {
        feedbackElement.textContent = "Incorrect! Try the next one.";
        feedbackElement.className = "feedback incorrect";
    }

    updateScore();
    currentQuestionIndex++;
    updateProgress();
    setTimeout(displayQuestion, 1000);
}

function updateScore() {
    document.getElementById("score").textContent = score;
}

function updateProgress() {
    document.getElementById("progress").textContent = currentQuestionIndex;
}

function startTimer() {
    const timerDisplay = document.getElementById("timer");
    const interval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0 || currentQuestionIndex >= maxQuestions) {
            clearInterval(interval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    document.getElementById("gameInterface").style.display = "none";
    highScores.push(score);
    highScores.sort((a, b) => b - a);

    const leaderboardHTML = `
        <h2>Game Over!</h2>
        <p>Your score: ${score} out of ${maxQuestions}</p>
        <h3>Leaderboard</h3>
        <table class="leaderboard-table">
            <thead><tr><th>Rank</th><th>Score</th></tr></thead>
            <tbody>
                ${highScores.slice(0, 5).map((s, i) => `<tr><td>${i + 1}</td><td>${s}</td></tr>`).join('')}
            </tbody>
        </table>
        <button onclick="restartGame()" class="button">Play Again</button>
    `;
    document.getElementById("leaderboard").innerHTML = leaderboardHTML;
    document.getElementById("leaderboard").style.display = "block";
}

function restartGame() {
    document.getElementById("leaderboard").style.display = "none";
    document.querySelector(".level-selection").style.display = "block";
}

document.addEventListener("DOMContentLoaded", loadWords);
