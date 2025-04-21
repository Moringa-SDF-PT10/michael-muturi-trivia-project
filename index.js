const startBtn = document.getElementById('start-btn');
const quizBox = document.getElementById('quiz-container');
const homeScreen = document.getElementById('start-screen');
const resultsPanel = document.getElementById('result-screen');
const questionLabel = document.getElementById('question');
const answerList = document.getElementById('answer-buttons');
const nextQuestionBtn = document.getElementById('next-btn');
const scoreDisplay = document.getElementById('score');
const reviewList = document.getElementById('correct-answers');
const retryBtn = document.getElementById('restart-btn');
const responseBox = document.getElementById('feedback');
const clock = document.getElementById('timer');
const categoryMenu = document.getElementById('category-select');

let questionSet = [];
let qIndex = 0;
let score = 0;
let mistakes = [];
let timerRef;
let secondsLeft = 15;
let quizStartTime;

startBtn.onclick = initQuiz;
nextQuestionBtn.onclick = () => {
  qIndex++;
  renderQuestion();
};
retryBtn.onclick = () => {
  resultsPanel.classList.add('hidden');
  homeScreen.classList.remove('hidden');
};

function initQuiz() {
  const questionCount = 5;
  const cat = categoryMenu.value;
  const difficulty = 'medium';
  const type = 'multiple';

  let api = `https://opentdb.com/api.php?amount=${questionCount}` +
            (cat ? `&category=${cat}` : '') +
            `&difficulty=${difficulty}&type=${type}`;

  fetch(api)
    .then(res => res.json())
    .then(data => {
      questionSet = data.results;
      qIndex = 0;
      score = 0;
      mistakes = [];
      quizStartTime = Date.now();

      homeScreen.classList.add('hidden');
      quizBox.classList.remove('hidden');

      renderQuestion();
    })
    .catch(err => {
      console.error('Quiz fetch failed:', err);
      alert("Couldn't start quiz. Try again later.");
    });
}

function renderQuestion() {
  if (timerRef) clearInterval(timerRef);

  responseBox.textContent = '';
  nextQuestionBtn.classList.add('hidden');

  if (!questionSet.length) {
    alert('No questions loaded.');
    quizBox.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    return;
  }

  if (qIndex >= questionSet.length) {
    showResults();
    return;
  }

  secondsLeft = 15;
  refreshTimer();
  timerRef = setInterval(() => {
    secondsLeft--;
    refreshTimer();
    if (secondsLeft <= 0) {
      clearInterval(timerRef);
      responseBox.textContent = "Time's up!";
      nextQuestionBtn.classList.remove('hidden');
    }
  }, 1000);

  const current = questionSet[qIndex];
  const question = unescapeHTML(current.question);
  const rightAnswer = unescapeHTML(current.correct_answer);
  const wrongAnswers = current.incorrect_answers.map(unescapeHTML);
  const options = shuffle([...wrongAnswers, rightAnswer]);

  questionLabel.textContent = question;
  answerList.innerHTML = '';

  options.forEach(opt => {
    const item = document.createElement('li');
    item.textContent = opt;
    item.onclick = () => handleGuess(item, rightAnswer, question);
    answerList.appendChild(item);
  });
}

function refreshTimer() {
  clock.textContent = `Time Left: ${secondsLeft}s`;
}

function showResults() {
  quizBox.classList.add('hidden');
  resultsPanel.classList.remove('hidden');

  const elapsed = Math.floor((Date.now() - quizStartTime) / 1000);
  scoreDisplay.textContent = `${score} / ${questionSet.length} (Time: ${elapsed}s)`;
  reviewList.innerHTML = mistakes.map(entry => `
    <p><strong>Q:</strong> ${entry.q}<br><strong>A:</strong> ${entry.a}</p>
  `).join('');
}

function handleGuess(selected, correctAns, qText) {
  clearInterval(timerRef);
  if (selected.textContent.trim() === correctAns.trim()) {
    responseBox.textContent = "Nice! 🎯";
    score++;
  } else {
    responseBox.textContent = `Nope 😓 Correct: ${correctAns}`;
    mistakes.push({ q: qText, a: correctAns });
  }
  nextQuestionBtn.classList.remove('hidden');
}

function unescapeHTML(html) {
  const area = document.createElement('textarea');
  area.innerHTML = html;
  return area.value;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
