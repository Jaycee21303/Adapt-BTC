import { sessionGuard, loadProgress, saveProgress } from './portal-auth.js';

async function initQuiz() {
  await sessionGuard('learning');
  const quizId = document.body.dataset.quiz;
  const response = await fetch(`/learning-portal/quizzes/${quizId}.json`);
  const quiz = await response.json();
  const container = document.getElementById('quiz');
  const progress = await loadProgress();

  let current = 0;
  let score = 0;
  const questions = quiz.questions.map(q => ({
    ...q,
    choices: shuffle([...q.choices])
  }));

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function renderQuestion() {
    const q = questions[current];
    container.innerHTML = `
      <div class="card">
        <div class="badge">${quiz.title}</div>
        <h3>Question ${current + 1} of ${questions.length}</h3>
        <p>${q.q}</p>
        <div id="choices" class="grid"></div>
      </div>`;
    const choiceBox = container.querySelector('#choices');
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary';
      btn.style.justifyContent = 'flex-start';
      btn.textContent = choice;
      btn.onclick = () => handleAnswer(idx);
      choiceBox.appendChild(btn);
    });
  }

  function handleAnswer(idx) {
    const originalIndex = questions[current].choices.indexOf(questions[current].choices[idx]);
    const correctText = questions[current].choices[questions[current].answer];
    if (questions[current].choices[idx] === correctText) score++;
    current++;
    if (current < questions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    const percent = Math.round((score / questions.length) * 100);
    const passed = percent >= (quiz.passingScore || 80);
    container.innerHTML = `
      <div class="card">
        <h2>${passed ? 'You passed!' : 'Keep going'}</h2>
        <p>Score: ${percent}%</p>
        <p>${passed ? 'Next lesson unlocked.' : 'Score 80%+ to unlock the next lesson.'}</p>
        <a class="btn" href="/learning-portal/dashboard.html">Return to dashboard</a>
      </div>`;

    progress.quizzes = progress.quizzes || {};
    progress.quizzes[quizId.replace('quiz','')] = { score: percent, passed };
    if (passed) {
      const lessonIndex = Number(quizId.replace('quiz','')) + 1;
      progress.lessons = progress.lessons || {};
      progress.lessons[lessonIndex] = 'unlocked';
    }
    saveProgress(progress);
  }

  renderQuestion();
}

document.addEventListener('DOMContentLoaded', initQuiz);
