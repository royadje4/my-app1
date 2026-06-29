const generateBtn = document.getElementById('generateBtn');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const quizBox = document.getElementById('quizBox');
const questionCategory = document.getElementById('questionCategory');
const questionDifficulty = document.getElementById('questionDifficulty');
const questionText = document.getElementById('questionText');
const answersBox = document.getElementById('answers');
const result = document.getElementById('result');
const statusText = document.getElementById('status');

const usedQuestionIds = new Set();

function decodeHTML(text) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function buildApiUrl() {
  const params = new URLSearchParams({
    amount: '1',
    type: 'multiple'
  });

  if (categorySelect.value) {
    params.append('category', categorySelect.value);
  }

  if (difficultySelect.value) {
    params.append('difficulty', difficultySelect.value);
  }

  return `https://opentdb.com/api.php?${params.toString()}`;
}

async function getFreshQuestion() {
  generateBtn.disabled = true;
  generateBtn.textContent = 'Loading...';
  statusText.textContent = 'Fetching a fresh question...';
  result.textContent = '';

  try {
    let question = null;
    let attempts = 0;

    while (!question && attempts < 6) {
      attempts++;
      const response = await fetch(buildApiUrl());

      if (!response.ok) {
        throw new Error('Could not reach the trivia service.');
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error('No question found for this selection. Try another category or difficulty.');
      }

      const candidate = data.results[0];
      const id = `${candidate.category}-${candidate.difficulty}-${candidate.question}`;

      if (!usedQuestionIds.has(id) || attempts === 6) {
        usedQuestionIds.add(id);
        question = candidate;
      }
    }

    showQuestion(question);
    statusText.textContent = 'Fresh question loaded.';
  } catch (error) {
    quizBox.classList.add('hidden');
    statusText.textContent = error.message;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate fresh question';
  }
}

function showQuestion(question) {
  quizBox.classList.remove('hidden');
  answersBox.innerHTML = '';
  result.textContent = '';

  const correctAnswer = decodeHTML(question.correct_answer);
  const allAnswers = shuffleArray([
    correctAnswer,
    ...question.incorrect_answers.map(decodeHTML)
  ]);

  questionCategory.textContent = decodeHTML(question.category);
  questionDifficulty.textContent = question.difficulty.toUpperCase();
  questionText.textContent = decodeHTML(question.question);

  allAnswers.forEach((answer) => {
    const button = document.createElement('button');
    button.className = 'answer-btn';
    button.textContent = answer;

    button.addEventListener('click', () => {
      const answerButtons = document.querySelectorAll('.answer-btn');
      answerButtons.forEach((btn) => {
        btn.disabled = true;
        if (btn.textContent === correctAnswer) {
          btn.classList.add('correct');
        }
      });

      if (answer === correctAnswer) {
        button.classList.add('correct');
        result.textContent = 'Correct! Nice one.';
      } else {
        button.classList.add('wrong');
        result.textContent = `Wrong. Correct answer: ${correctAnswer}`;
      }
    });

    answersBox.appendChild(button);
  });
}

generateBtn.addEventListener('click', getFreshQuestion);
