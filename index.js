const startButton = document.getElementById('start-btn');
const quizDiv = document.getElementById('quiz-container');
const startDiv = document.getElementById('start-screen');
const resultDiv = document.getElementById('result-screen');
const questionBox = document.getElementById('question');
const answersUl = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
const scoreText = document.getElementById('score');
const missedList = document.getElementById('correct-answers');
const restartButton = document.getElementById('restart-btn');
const feedbackBox = document.getElementById('feedback');
const timerDisplay = document.getElementById('timer');
const categorySelect = document.getElementById('category-select');

let questions = [];
let currentIndex = 0;
let totalScore = 0;
let missedQs = [];
let questionTimer;
let timeLeft = 15;
let totalTimeStart;

startButton.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', () => {
  currentIndex++;
  showQuestion();
});
restartButton.addEventListener('click', () => {
  resultDiv.classList.add('hidden');
  startDiv.classList.remove('hidden');
});

function startQuiz() {
  const amount = 5;
  const category = categorySelect.value;
  const difficulty = "medium";
  const type = "multiple";

  let apiURL = `https://opentdb.com/api.php?amount=${amount}${category ? `&category=${category}` : ''}${difficulty ? `&difficulty=${difficulty}` : ''}${type ? `&type=${type}` : ''}`;

  fetch(apiURL)
    .then(res => res.json())
    .then(data => {
      questions = data.results;
      currentIndex = 0;
      totalScore = 0;
      missedQs = [];
      totalTimeStart = Date.now();

      startDiv.classList.add('hidden');
      quizDiv.classList.remove('hidden');

      showQuestion();
    })
    .catch(error => {
      console.error("Error fetching questions from API:", error);
      alert(`Couldn't load quiz. Error: ${error.message || "Unknown error"}. Please check your internet connection or try again later.`);
    });
}

function showQuestion() {
  if (questionTimer) {
    clearInterval(questionTimer);
  }

  feedbackBox.innerText = '';
  nextBtn.classList.add('hidden');

  if (questions.length === 0) {
    alert("No questions available. Please try again later.");
    quizDiv.classList.add('hidden');
    startDiv.classList.remove('hidden');
    return;
  }

  if (currentIndex >= questions.length) {
    endQuiz();
    return;
  }

  timeLeft = 15;
  updateTimer();
  questionTimer = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(questionTimer);
      feedbackBox.innerText = "Time's up!";
      nextBtn.classList.remove('hidden');
    }
  }, 1000);

  let qData = questions[currentIndex];
  let question = decodeHTML(qData.question);
  let correct = decodeHTML(qData.correct_answer);
  let incorrect = qData.incorrect_answers.map(ans => decodeHTML(ans));
  let choices = fisherYatesShuffle([correct, ...incorrect]);

  questionBox.innerText = question;
  answersUl.innerHTML = '';

  choices.forEach(choice => {
    let li = document.createElement('li');
    li.innerText = choice;
    li.addEventListener('click', () => handleAnswerSelection(li, correct, question));
    answersUl.appendChild(li);
  });
}

function updateTimer() {
  timerDisplay.innerText = `Time Left: ${timeLeft}s`;
}

function endQuiz() {
  quizDiv.classList.add('hidden');
  resultDiv.classList.remove('hidden');

  let totalTime = Math.round((Date.now() - totalTimeStart) / 1000);
  scoreText.innerText = `${totalScore} / ${questions.length} (Time: ${totalTime}s)`;
  missedList.innerHTML = missedQs.map(miss => `<p><strong>Q:</strong> ${miss.q}<br><strong>A:</strong> ${miss.a}</p>`).join('');
}

function handleAnswerSelection(selectedLi, correctAnswer, questionText) {
  clearInterval(questionTimer);
  if (selectedLi.innerText.trim() === correctAnswer.trim()) {
    feedbackBox.innerText = "Correct answer 🎉";
    totalScore++;
  } else {
    feedbackBox.innerText = "Incorrect 😔. The correct answer is: " + correctAnswer;
    missedQs.push({ q: questionText, a: correctAnswer });
  }
  nextBtn.classList.remove('hidden');
}

function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function fisherYatesShuffle(array) {
  const arrayCopy = [...array];
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  return arrayCopy;
}
