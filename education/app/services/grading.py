def grade_quiz(quiz, responses):
    questions = quiz.get("questions", [])
    correct = 0
    details = []
    for idx, question in enumerate(questions):
        key = f"q{idx + 1}"
        answer = responses.get(key)
        is_correct = False
        if question.get("type") == "mcq":
            try:
                is_correct = int(answer or -1) == question.get("answer_index")
            except ValueError:
                is_correct = False
        elif question.get("type") == "true_false":
            is_correct = str(answer).lower() == str(question.get("answer")).lower()
        details.append({"prompt": question.get("prompt"), "correct": is_correct, "explanation": question.get("explanation")})
        if is_correct:
            correct += 1
    score = round((correct / max(len(questions), 1)) * 100, 2)
    return {"score": score, "details": details, "passed": score >= quiz.get("passing_score", 0)}
