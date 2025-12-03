export function renderQuiz(container, quiz, onPass) {
    if (!container) return;
    container.innerHTML = '';
    const quizTitle = document.createElement('h3');
    quizTitle.textContent = `${quiz.title} Quiz`;
    container.appendChild(quizTitle);

    quiz.questions.forEach((q, index) => {
        const block = document.createElement('div');
        block.className = 'quiz-question';

        const heading = document.createElement('h4');
        heading.textContent = `${index + 1}. ${q.prompt}`;
        block.appendChild(heading);

        const optionsWrap = document.createElement('div');
        optionsWrap.className = 'quiz-options';

        q.options.forEach((option, idx) => {
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `question-${index}`;
            input.value = idx;
            label.appendChild(input);
            label.appendChild(document.createTextNode(option));
            optionsWrap.appendChild(label);
        });

        block.appendChild(optionsWrap);
        container.appendChild(block);
    });

    const actions = document.createElement('div');
    actions.className = 'quiz-actions';
    const gradeBtn = document.createElement('button');
    gradeBtn.className = 'button';
    gradeBtn.textContent = 'Grade quiz';
    const resetBtn = document.createElement('button');
    resetBtn.className = 'button secondary';
    resetBtn.textContent = 'Reset';

    actions.appendChild(gradeBtn);
    actions.appendChild(resetBtn);
    container.appendChild(actions);

    const results = document.createElement('div');
    results.className = 'quiz-results';
    container.appendChild(results);

    gradeBtn.addEventListener('click', () => {
        let score = 0;
        const explanations = [];

        quiz.questions.forEach((q, index) => {
            const selected = container.querySelector(`input[name="question-${index}"]:checked`);
            const choice = selected ? parseInt(selected.value, 10) : -1;
            const correct = choice === q.answer;
            if (correct) score += 1;
            explanations.push({ correct, text: q.explanation });
        });

        const percentage = Math.round((score / quiz.questions.length) * 100);
        results.innerHTML = `<div class="alert ${percentage >= 80 ? 'success' : 'warning'}">${score} / ${quiz.questions.length} correct (${percentage}%). ${percentage >= 80 ? 'You passed! Certificates unlocked.' : 'You need 80% to pass.'}</div>`;

        const detailList = document.createElement('div');
        detailList.className = 'card-stack';
        explanations.forEach((entry, idx) => {
            const row = document.createElement('div');
            row.className = 'card-row';
            const icon = document.createElement('div');
            icon.className = 'icon-circle';
            icon.textContent = entry.correct ? '✓' : '✕';
            const text = document.createElement('div');
            text.innerHTML = `<strong>Question ${idx + 1}</strong><div class="text-muted">${entry.text}</div>`;
            row.appendChild(icon);
            row.appendChild(text);
            detailList.appendChild(row);
        });
        results.appendChild(detailList);

        if (percentage >= 80 && typeof onPass === 'function') {
            onPass({ score, percentage });
        }
    });

    resetBtn.addEventListener('click', () => {
        container.querySelectorAll('input[type="radio"]').forEach((input) => (input.checked = false));
        results.innerHTML = '';
    });
}
